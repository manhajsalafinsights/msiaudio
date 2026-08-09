"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";
import { requireAdmin } from "@/lib/auth/session";
import type { ActionState } from "@/types/action";
import { slugify } from "@/utils/slugify";
import { uniqueSlug } from "@/features/admin/lib/slug";
import { extractYouTubeVideoId, getYouTubeThumbnail, getYouTubeOEmbed } from "@/utils/media";
import { recalcSeriesTotals } from "@/repositories/series-repository";
import {
  audioSlugExists,
  audioNomorSesiExists,
  getNextNomorSesi as getNextNomorSesiRepo,
} from "@/repositories/audio-repository";
import { audioFormSchema, type AudioFormInput } from "@/features/admin/audio/validation";
import { cleanupCover } from "@/lib/supabase/storage";

function revalidatePublic() {
  revalidatePath("/", "layout");
}

/** Cek apakah video YouTube sudah dipakai audio lain. */
async function findMediaConflict(provider: "YOUTUBE", providerId: string, excludeAudioId?: string) {
  return prisma.mediaSource.findFirst({
    where: {
      provider,
      providerId,
      ...(excludeAudioId ? { audioId: { not: excludeAudioId } } : {}),
    },
    select: { audio: { select: { judul: true } } },
  });
}

function friendlyPrismaMessage(error: unknown): string | null {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return "Data sudah ada (ada yang sama sudah tersimpan).";
  }
  return null;
}

function buildMediaSourceData(youtubeUrl: string) {
  const videoId = extractYouTubeVideoId(youtubeUrl);
  if (!videoId) return null;
  return {
    provider: "YOUTUBE" as const,
    providerId: videoId,
    url: youtubeUrl,
    metadata: {
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      thumbnail: getYouTubeThumbnail(videoId),
    },
  };
}

async function resolveSlug(input: AudioFormInput, excludeId?: string) {
  const base = input.slug.trim() || slugify(input.judul);
  if (!base) throw new Error("Slug tidak dapat dibuat dari judul");
  return uniqueSlug(base, (slug) => audioSlugExists(slug, excludeId));
}

export interface YouTubeMetadata {
  title: string | null;
  durationSeconds: number | null;
  thumbnail: string;
}

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 500;

// Innertube API key publik milik klien web YouTube (di-embed di halaman
// watch). Bukan secret — hanya dipakai untuk memanggil endpoint player.
const YOUTUBE_WEB_INNERTUBE_KEY = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < RETRY_ATTEMPTS - 1) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
  }
  throw lastError;
}

/** Ubah durasi ISO-8601 (mis. "PT1H2M3S") menjadi detik. */
function parseISO8601Duration(input?: string): number | null {
  if (!input) return null;
  const m = input.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return null;
  const total = Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
  return total > 0 ? total : null;
}

/**
 * Ambil metadata video YouTube (judul, durasi, thumbnail).
 * Prioritas sumber (untuk mengatasi pemblokiran IP datacenter Vercel):
 *  1. YouTube Data API v3 — butuh YOUTUBE_API_KEY (paling andal, resmi).
 *  2. youtubei/v1/player (klien WEB) — tanpa key, andal dari IP rumah.
 *  3. oEmbed (judul) + regex lengthSeconds halaman watch (durasi).
 */
export async function fetchYouTubeMetadata(url: string): Promise<ActionState<YouTubeMetadata>> {
  try {
    await requireAdmin();
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      return { ok: false, error: { code: "VALIDATION_ERROR", message: "URL YouTube tidak valid" } };
    }

    const thumbnail = getYouTubeThumbnail(videoId);
    let title: string | null = null;
    let durationSeconds: number | null = null;

    // 1) YouTube Data API v3 (bila key tersedia).
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (apiKey) {
      try {
        const res = await withRetry(() =>
          fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`,
            { signal: AbortSignal.timeout(10000) },
          ),
        );
        if (res.ok) {
          const data = (await res.json()) as {
            items?: { snippet?: { title?: string }; contentDetails?: { duration?: string } }[];
          };
          const item = data.items?.[0];
          if (item) {
            if (item.snippet?.title) title = item.snippet.title;
            const len = parseISO8601Duration(item.contentDetails?.duration);
            if (len) durationSeconds = len;
          }
        }
      } catch {
        // lanjut ke sumber cadangan
      }
    }

    // 2) Endpoint internal YouTube (WEB client) — tanpa key.
    if (!title || !durationSeconds) {
      try {
        const res = await withRetry(() =>
          fetch(`https://www.youtube.com/youtubei/v1/player?key=${YOUTUBE_WEB_INNERTUBE_KEY}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
            body: JSON.stringify({
              context: {
                client: {
                  clientName: "WEB",
                  clientVersion: "2.20240101.00.00",
                  hl: "id",
                  gl: "ID",
                },
              },
              videoId,
            }),
            signal: AbortSignal.timeout(10000),
          }),
        );
        if (res.ok) {
          const data = (await res.json()) as {
            videoDetails?: { title?: string; lengthSeconds?: string };
          };
          const vd = data.videoDetails;
          if (vd?.title) title = title ?? vd.title;
          const len = vd?.lengthSeconds;
          if (len) {
            const n = Number(len);
            if (Number.isFinite(n) && n > 0) durationSeconds = n;
          }
        }
      } catch {
        // lanjut ke cadangan
      }
    }

    // 3) Cadangan judul — oEmbed.
    if (!title) {
      try {
        const oembed = await withRetry(() => getYouTubeOEmbed(url));
        if (oembed?.title) title = oembed.title;
      } catch {
        // lanjut
      }
    }

    // 4) Cadangan durasi — scrape halaman watch.
    if (!durationSeconds) {
      try {
        const res = await withRetry(() =>
          fetch(`https://www.youtube.com/watch?v=${videoId}&hl=en`, {
            headers: {
              "Accept-Language": "en",
              "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
            signal: AbortSignal.timeout(10000),
          }),
        );
        if (res.ok) {
          const html = await res.text();
          const len = html.match(/"lengthSeconds":"?(\d+)"?/)?.[1];
          if (len) {
            const n = Number(len);
            if (Number.isFinite(n) && n > 0) durationSeconds = n;
          }
        }
      } catch {
        // durasi tidak didapat; tetap kembalikan judul/thumbnail bila ada
      }
    }

    if (!title && !durationSeconds) {
      return {
        ok: false,
        error: { code: "NOT_FOUND", message: "Tidak dapat mengambil metadata video" },
      };
    }

    return { ok: true, data: { title, durationSeconds, thumbnail } };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: error instanceof Error ? error.message : "Gagal mengambil metadata video",
      },
    };
  }
}

/** Nomor sesi otomatis berikutnya untuk sebuah series (form tambah). */
export async function getNextNomorSesi(seriesId: string): Promise<ActionState<number>> {
  try {
    await requireAdmin();
    return { ok: true, data: await getNextNomorSesiRepo(seriesId) };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: error instanceof Error ? error.message : "Gagal menentukan nomor sesi",
      },
    };
  }
}

export async function createAudio(input: AudioFormInput): Promise<ActionState<string>> {
  try {
    await requireAdmin();
    const parsed = audioFormSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: { code: "VALIDATION_ERROR", message: "Data tidak valid" } };
    }
    const data = parsed.data;

    if (await audioNomorSesiExists(data.seriesId, data.nomorSesi)) {
      return {
        ok: false,
        error: {
          code: "CONFLICT",
          message: `Nomor sesi ${data.nomorSesi} sudah dipakai di series ini`,
        },
      };
    }

    const slug = await resolveSlug(data);
    const media = data.youtubeUrl ? buildMediaSourceData(data.youtubeUrl) : null;

    if (media) {
      const conflict = await findMediaConflict(media.provider, media.providerId);
      if (conflict) {
        return {
          ok: false,
          error: {
            code: "CONFLICT",
            message: `Video YouTube ini sudah dipakai oleh audio "${conflict.audio.judul}". Ganti URL atau edit audio tersebut.`,
          },
        };
      }
    }

    const audio = await prisma.audio.create({
      data: {
        judul: data.judul,
        slug,
        seriesId: data.seriesId,
        nomorSesi: data.nomorSesi,
        deskripsi: data.deskripsi || null,
        durasi: data.durasi,
        cover: data.cover || null,
        published: data.published,
        mediaSources: media ? { create: media } : undefined,
      },
    });

    await recalcSeriesTotals(data.seriesId);
    revalidatePublic();
    return { ok: true, data: audio.id };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: friendlyPrismaMessage(error) ?? "Gagal membuat audio",
      },
    };
  }
}

export async function updateAudio(id: string, input: AudioFormInput): Promise<ActionState> {
  try {
    await requireAdmin();
    const parsed = audioFormSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: { code: "VALIDATION_ERROR", message: "Data tidak valid" } };
    }
    const data = parsed.data;

    if (await audioNomorSesiExists(data.seriesId, data.nomorSesi, id)) {
      return {
        ok: false,
        error: {
          code: "CONFLICT",
          message: `Nomor sesi ${data.nomorSesi} sudah dipakai di series ini`,
        },
      };
    }

    const slug = await resolveSlug(data, id);
    const media = data.youtubeUrl ? buildMediaSourceData(data.youtubeUrl) : null;

    const existing = await prisma.audio.findUnique({ where: { id }, select: { cover: true } });
    await prisma.audio.update({
      where: { id },
      data: {
        judul: data.judul,
        slug,
        seriesId: data.seriesId,
        nomorSesi: data.nomorSesi,
        deskripsi: data.deskripsi || null,
        durasi: data.durasi,
        cover: data.cover || null,
        published: data.published,
      },
    });
    await cleanupCover(existing?.cover ?? null, data.cover || null);

    if (media) {
      const mediaRow = await prisma.mediaSource.findFirst({
        where: { audioId: id },
        select: { id: true, providerId: true },
      });
      if (!mediaRow || mediaRow.providerId !== media.providerId) {
        const conflict = await findMediaConflict(media.provider, media.providerId, id);
        if (conflict) {
          return {
            ok: false,
            error: {
              code: "CONFLICT",
              message: `Video YouTube ini sudah dipakai oleh audio "${conflict.audio.judul}". Ganti URL atau edit audio tersebut.`,
            },
          };
        }
        await prisma.mediaSource.deleteMany({ where: { audioId: id } });
        await prisma.mediaSource.create({ data: { audioId: id, ...media } });
      }
    }

    await recalcSeriesTotals(data.seriesId);
    revalidatePublic();
    return { ok: true, data: undefined };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: friendlyPrismaMessage(error) ?? "Gagal memperbarui audio",
      },
    };
  }
}

export async function deleteAudio(id: string): Promise<ActionState> {
  try {
    await requireAdmin();
    const audio = await prisma.audio.findUnique({
      where: { id },
      select: { seriesId: true, cover: true },
    });
    if (!audio)
      return { ok: false, error: { code: "NOT_FOUND", message: "Audio tidak ditemukan" } };
    await prisma.audio.delete({ where: { id } });
    await cleanupCover(audio.cover, null);
    await recalcSeriesTotals(audio.seriesId);
    revalidatePublic();
    return { ok: true, data: undefined };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: error instanceof Error ? error.message : "Gagal menghapus audio",
      },
    };
  }
}

export async function setAudioStatus(id: string, published: boolean): Promise<ActionState> {
  try {
    await requireAdmin();
    await prisma.audio.update({ where: { id }, data: { published } });
    revalidatePublic();
    return { ok: true, data: undefined };
  } catch {
    return { ok: false, error: { code: "UNKNOWN_ERROR", message: "Gagal mengubah status" } };
  }
}

export async function bulkAudioStatus(ids: string[], published: boolean): Promise<ActionState> {
  try {
    await requireAdmin();
    if (ids.length === 0)
      return { ok: false, error: { code: "VALIDATION_ERROR", message: "Tidak ada data dipilih" } };
    await prisma.audio.updateMany({ where: { id: { in: ids } }, data: { published } });
    revalidatePublic();
    return { ok: true, data: undefined };
  } catch {
    return { ok: false, error: { code: "UNKNOWN_ERROR", message: "Gagal mengubah status" } };
  }
}

export async function bulkDeleteAudio(ids: string[]): Promise<ActionState> {
  try {
    await requireAdmin();
    if (ids.length === 0)
      return { ok: false, error: { code: "VALIDATION_ERROR", message: "Tidak ada data dipilih" } };

    const audios = await prisma.audio.findMany({
      where: { id: { in: ids } },
      select: { seriesId: true, cover: true },
    });
    await prisma.audio.deleteMany({ where: { id: { in: ids } } });

    await Promise.all(audios.filter((a) => a.cover).map((a) => cleanupCover(a.cover, null)));

    const seriesIds = [...new Set(audios.map((a) => a.seriesId))];
    await Promise.all(seriesIds.map((seriesId) => recalcSeriesTotals(seriesId)));
    revalidatePublic();

    return { ok: true, data: undefined };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: error instanceof Error ? error.message : "Gagal menghapus",
      },
    };
  }
}
