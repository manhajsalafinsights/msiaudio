"use server";

import { revalidatePath } from "next/cache";
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
} from "@/repositories/audio-repository";
import { audioFormSchema, type AudioFormInput } from "@/features/admin/audio/validation";
import { cleanupCover } from "@/lib/supabase/storage";

function revalidatePublic() {
  revalidatePath("/", "layout");
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

/**
 * Ambil metadata video YouTube (judul, durasi, thumbnail) tanpa API key.
 * - Judul: fallback oEmbed (andal) + parse ytInitialPlayerResponse.
 * - Durasi: parse "lengthSeconds" dari halaman watch.
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

    try {
      const oembed = await withRetry(() => getYouTubeOEmbed(url));
      if (oembed?.title) title = oembed.title;
    } catch {
      // lanjut scrape
    }

    try {
      const res = await withRetry(() =>
        fetch(`https://www.youtube.com/watch?v=${videoId}`, {
          headers: { "Accept-Language": "id" },
          signal: AbortSignal.timeout(10000),
        }),
      );
      if (res.ok) {
        const html = await res.text();
        const m = html.match(/ytInitialPlayerResponse\s*=\s*([\s\S]*?);\s*<\/script>/);
        if (m) {
          const data = JSON.parse(m[1]);
          const vd = data?.videoDetails;
          if (vd?.title) title = vd.title;
          const len = vd?.lengthSeconds;
          if (len != null) {
            const n = Number(len);
            if (Number.isFinite(n) && n > 0) durationSeconds = n;
          }
        }
      }
    } catch {
      // durasi tidak didapat; tetap kembalikan judul/thumbnail bila ada
    }

    if (!title && !durationSeconds) {
      return { ok: false, error: { code: "NOT_FOUND", message: "Tidak dapat mengambil metadata video" } };
    }

    return { ok: true, data: { title, durationSeconds, thumbnail } };
  } catch (error) {
    return { ok: false, error: { code: "UNKNOWN_ERROR", message: error instanceof Error ? error.message : "Gagal mengambil metadata video" } };
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
      return { ok: false, error: { code: "CONFLICT", message: `Nomor sesi ${data.nomorSesi} sudah dipakai di series ini` } };
    }

    const slug = await resolveSlug(data);
    const media = data.youtubeUrl ? buildMediaSourceData(data.youtubeUrl) : null;

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
    return { ok: false, error: { code: "UNKNOWN_ERROR", message: error instanceof Error ? error.message : "Gagal membuat audio" } };
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
      return { ok: false, error: { code: "CONFLICT", message: `Nomor sesi ${data.nomorSesi} sudah dipakai di series ini` } };
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
        await prisma.mediaSource.deleteMany({ where: { audioId: id } });
        await prisma.mediaSource.create({ data: { audioId: id, ...media } });
      }
    }

    await recalcSeriesTotals(data.seriesId);
    revalidatePublic();
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: { code: "UNKNOWN_ERROR", message: error instanceof Error ? error.message : "Gagal memperbarui audio" } };
  }
}

export async function deleteAudio(id: string): Promise<ActionState> {
  try {
    await requireAdmin();
    const audio = await prisma.audio.findUnique({ where: { id }, select: { seriesId: true, cover: true } });
    if (!audio) return { ok: false, error: { code: "NOT_FOUND", message: "Audio tidak ditemukan" } };
    await prisma.audio.delete({ where: { id } });
    await cleanupCover(audio.cover, null);
    await recalcSeriesTotals(audio.seriesId);
    revalidatePublic();
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: { code: "UNKNOWN_ERROR", message: error instanceof Error ? error.message : "Gagal menghapus audio" } };
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
    if (ids.length === 0) return { ok: false, error: { code: "VALIDATION_ERROR", message: "Tidak ada data dipilih" } };
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
    if (ids.length === 0) return { ok: false, error: { code: "VALIDATION_ERROR", message: "Tidak ada data dipilih" } };

    const audios = await prisma.audio.findMany({
      where: { id: { in: ids } },
      select: { seriesId: true, cover: true },
    });
    await prisma.audio.deleteMany({ where: { id: { in: ids } } });

    await Promise.all(
      audios.filter((a) => a.cover).map((a) => cleanupCover(a.cover, null)),
    );

    const seriesIds = [...new Set(audios.map((a) => a.seriesId))];
    await Promise.all(seriesIds.map((seriesId) => recalcSeriesTotals(seriesId)));
    revalidatePublic();

    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: { code: "UNKNOWN_ERROR", message: error instanceof Error ? error.message : "Gagal menghapus" } };
  }
}
