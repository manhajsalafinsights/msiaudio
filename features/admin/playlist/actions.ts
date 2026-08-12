"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";
import { requireAdmin } from "@/lib/auth/session";
import type { ActionState } from "@/types/action";
import { slugify } from "@/utils/slugify";
import { uniqueSlug } from "@/features/admin/lib/slug";
import { seriesSlugExists, recalcSeriesTotals } from "@/repositories/series-repository";
import { audioSlugExists } from "@/repositories/audio-repository";
import { extractPlaylistId, fetchYouTubePlaylist } from "@/utils/youtube-playlist";
import { isUnavailableVideo } from "@/features/admin/playlist/video-utils";

function revalidatePublic() {
  revalidatePath("/", "layout");
}

export type PlaylistPreviewItem = {
  position: number;
  videoId: string;
  title: string;
  durationSeconds: number | null;
  thumbnail: string;
  duplicate: boolean;
  privateVideo: boolean;
};

export type PlaylistPreview = {
  playlistTitle: string;
  source: "data-api" | "rss";
  truncated: boolean;
  items: PlaylistPreviewItem[];
};

export type ImportSummary = {
  seriesId: string;
  seriesSlug: string;
  seriesTitle: string;
  imported: number;
  skippedDuplicates: number;
  skippedUnavailable: number;
  skippedSesiConflict: number;
  /** created = series baru; merged = ditambahkan ke series berjudul sama; skipped = semua sudah ada. */
  action: "created" | "merged" | "skipped";
};

const confirmSchema = z
  .object({
    playlistUrl: z.string().trim().min(1, "URL playlist wajib diisi"),
    mode: z.enum(["new", "existing"]).default("new"),
    seriesTypeId: z.string().optional(),
    autoDetectType: z.boolean().default(false),
    targetSeriesId: z.string().optional(),
    published: z.boolean(),
    cleanTitles: z.boolean(),
    selectedVideoIds: z.array(z.string()).min(1, "Pilih minimal 1 video"),
  })
  .superRefine((val, ctx) => {
    if (val.mode === "new" && !val.seriesTypeId && !val.autoDetectType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["seriesTypeId"],
        message: "Pilih kitab/tipe series",
      });
    }
    if (val.mode === "existing" && !val.targetSeriesId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["targetSeriesId"],
        message: "Pilih series tujuan",
      });
    }
  });

// Kata kunci deteksi tipe series dari judul (urutan = prioritas, spesifik dulu).
const TYPE_KEYWORDS: { slug: string; keywords: string[] }[] = [
  { slug: "kitab-bahasa-arab", keywords: ["bahasa arab", "kitab arab"] },
  { slug: "kitab-muslimah", keywords: ["kitab muslimah"] },
  { slug: "tematik", keywords: ["tematik"] },
  { slug: "kajian-kitab", keywords: ["kajian kitab", "kitab"] },
];

/** Deteksi otomatis tipe series dari judul (kitab / tematik), null bila tak cocok. */
async function detectSeriesTypeId(title: string): Promise<string | null> {
  const lower = title.toLowerCase();
  const types = await prisma.seriesType.findMany({ select: { id: true, slug: true } });
  const bySlug = new Map(types.map((t) => [t.slug, t.id]));
  for (const rule of TYPE_KEYWORDS) {
    if (rule.keywords.some((k) => lower.includes(k))) {
      return bySlug.get(rule.slug) ?? null;
    }
  }
  return null;
}

/** Ambil daftar video playlist untuk preview + tandai video yang sudah dipakai. */
export async function previewPlaylist(playlistUrl: string): Promise<ActionState<PlaylistPreview>> {
  try {
    await requireAdmin();
    const playlistId = extractPlaylistId(playlistUrl);
    if (!playlistId) {
      return {
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "URL atau ID playlist tidak valid. Gunakan playlist?list=PL...",
        },
      };
    }

    const result = await fetchYouTubePlaylist(playlistId);
    if (!result.ok) return { ok: false, error: result.error };

    const existing = await prisma.mediaSource.findMany({
      where: {
        provider: "YOUTUBE",
        providerId: { in: result.items.map((i) => i.videoId) },
      },
      select: { providerId: true },
    });
    const duplicateIds = new Set(existing.map((e) => e.providerId));

    return {
      ok: true,
      data: {
        playlistTitle: result.playlistTitle,
        source: result.source,
        truncated: result.truncated,
        items: result.items.map((i) => ({
          ...i,
          duplicate: duplicateIds.has(i.videoId),
          privateVideo: isUnavailableVideo(i.title),
        })),
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: error instanceof Error ? error.message : "Gagal memuat playlist",
      },
    };
  }
}

/** Bersihkan prefix nomor di awal judul (mis. "01 - ", "1. ", "#13", "Ep 3 - "). */
function cleanLeadingNumber(title: string): string {
  const cleaned = title
    .replace(/^\s*\d{1,3}\s*[-–—.:]\s*/, "")
    .replace(/^\s*(?:ep|e|sesi)\s*\d{1,3}\s*[-–—.:]?\s*/i, "")
    .replace(/^\s*#\s*\d+\s*/, "")
    .trim();
  return cleaned || title;
}

/**
 * Impor video playlist ke dalam series.
 * - mode "new": buat SERIES BARU (judul = judul playlist) untuk semua tipe,
 *   termasuk Tematik.
 * - mode "existing": tambahkan audio ke series yang dipilih (nomor sesi
 *   melanjutkan sesi terakhir series tersebut).
 * Duplikat video (sudah dipakai audio lain) dilewati dan dilaporkan —
 * bukan mengagalkan seluruh import.
 */
export async function importPlaylistAsSeries(
  input: z.infer<typeof confirmSchema>,
): Promise<ActionState<ImportSummary>> {
  try {
    await requireAdmin();
    const parsed = confirmSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: { code: "VALIDATION_ERROR", message: "Data tidak valid" } };
    }
    const data = parsed.data;

    const playlistId = extractPlaylistId(data.playlistUrl);
    if (!playlistId) {
      return {
        ok: false,
        error: { code: "VALIDATION_ERROR", message: "URL atau ID playlist tidak valid" },
      };
    }

    const result = await fetchYouTubePlaylist(playlistId);
    if (!result.ok) return { ok: false, error: result.error };

    const selectedIds = new Set(data.selectedVideoIds);
    const items = result.items.filter(
      (i) => selectedIds.has(i.videoId) && !isUnavailableVideo(i.title),
    );
    if (items.length === 0) {
      return {
        ok: false,
        error: { code: "VALIDATION_ERROR", message: "Tidak ada video yang dipilih" },
      };
    }

    // Hitung duplikat & audio yang benar-benar bisa diimpor SEBELUM membuat
    // series, supaya mode "new" tidak menghasilkan series kosong.
    const existingMedia = await prisma.mediaSource.findMany({
      where: { provider: "YOUTUBE", providerId: { in: items.map((i) => i.videoId) } },
      select: { providerId: true },
    });
    const duplicateIds = new Set(existingMedia.map((e) => e.providerId));

    const skippedUnavailable = result.items.filter(
      (i) => selectedIds.has(i.videoId) && isUnavailableVideo(i.title),
    ).length;

    // Hitung slug audio unik (jaga dari bentrok antar item maupun DB).
    const usedSlugs = new Set<string>();
    const prep = items.map((item) => {
      const judul = data.cleanTitles ? cleanLeadingNumber(item.title) : item.title;
      return { item, judul };
    });

    async function nextAudioSlug(base: string, fallbackIndex: number): Promise<string> {
      let candidate = base || `audio-${fallbackIndex}`;
      let counter = 2;
      while (usedSlugs.has(candidate) || (await audioSlugExists(candidate))) {
        candidate = `${base || `audio-${fallbackIndex}`}-${counter}`;
        counter += 1;
      }
      usedSlugs.add(candidate);
      return candidate;
    }

    let imported = 0;
    let skippedDuplicates = 0;
    const skippedSesiConflict = 0;
    const audioRows: {
      item: (typeof items)[number];
      judul: string;
      slug: string;
    }[] = [];

    for (const p of prep) {
      if (duplicateIds.has(p.item.videoId)) {
        skippedDuplicates++;
        continue;
      }
      const slug = await nextAudioSlug(slugify(p.judul), p.item.position);
      audioRows.push({ item: p.item, judul: p.judul, slug });
    }

    // Target series: mode "existing" menambahkan ke series yang dipilih;
    // mode "new" biasanya membuat series baru (judul = judul playlist),
    // KECUALI sudah ada series berjudul sama → di-merge / di-skip.
    let series: { id: string; judul: string; slug: string } | null = null;
    let baseNomorSesi = 0;
    let action: ImportSummary["action"] = "created";

    if (data.mode === "existing") {
      const target = await prisma.series.findUnique({
        where: { id: data.targetSeriesId! },
        select: { id: true, judul: true, slug: true },
      });
      if (!target) {
        return {
          ok: false,
          error: { code: "VALIDATION_ERROR", message: "Series tujuan tidak ditemukan" },
        };
      }
      series = target;
      const agg = await prisma.audio.aggregate({
        where: { seriesId: target.id },
        _max: { nomorSesi: true },
      });
      baseNomorSesi = agg._max.nomorSesi ?? 0;
    } else {
      const seriesTitle = result.playlistTitle || "Playlist";

      // Cek series berjudul sama: jangan bikin duplikat.
      const sameTitle = await prisma.series.findFirst({
        where: { judul: seriesTitle },
        select: {
          id: true,
          judul: true,
          slug: true,
          audio: {
            select: {
              mediaSources: { where: { provider: "YOUTUBE" }, select: { providerId: true } },
            },
          },
        },
      });
      if (sameTitle) {
        const existingVideoIds = new Set(
          sameTitle.audio.flatMap((a) => a.mediaSources.map((m) => m.providerId)),
        );
        const overlap = items.filter((i) => existingVideoIds.has(i.videoId)).length;
        const missingCount = items.length - overlap;

        if (missingCount === 0) {
          // Semua video sudah ada di series berjudul sama → skip, jangan duplikat.
          return {
            ok: true,
            data: {
              seriesId: sameTitle.id,
              seriesSlug: sameTitle.slug,
              seriesTitle: sameTitle.judul,
              imported: 0,
              skippedDuplicates: items.length,
              skippedUnavailable,
              skippedSesiConflict,
              action: "skipped",
            },
          };
        }
        if (overlap > 0 || sameTitle.audio.length === 0) {
          // Series sama (atau kosong): tambahkan video yang belum ada ke series itu.
          series = { id: sameTitle.id, judul: sameTitle.judul, slug: sameTitle.slug };
          const agg = await prisma.audio.aggregate({
            where: { seriesId: sameTitle.id },
            _max: { nomorSesi: true },
          });
          baseNomorSesi = agg._max.nomorSesi ?? 0;
          action = "merged";
        }
      }

      // Lebih dulu untuk menghindari series kosong (semua duplikat global).
      if (audioRows.length === 0) {
        return {
          ok: false,
          error: {
            code: "ALL_DUPLICATES",
            message: "Semua video sudah pernah diimpor (duplikat) — series tidak dibuat.",
          },
        };
      }

      if (action === "created") {
        let typeId = data.seriesTypeId;
        if (!typeId && data.autoDetectType) {
          typeId = (await detectSeriesTypeId(seriesTitle)) ?? undefined;
        }
        if (!typeId) {
          return {
            ok: false,
            error: {
              code: "VALIDATION_ERROR",
              message:
                "Tidak dapat mendeteksi tipe series dari judul (kitab/tematik) — pilih tipe secara manual",
            },
          };
        }
        const seriesType = await prisma.seriesType.findUnique({
          where: { id: typeId },
          select: { id: true, slug: true },
        });
        if (!seriesType) {
          return {
            ok: false,
            error: { code: "VALIDATION_ERROR", message: "Kitab/tipe series tidak ditemukan" },
          };
        }

        const created = await prisma.series.create({
          data: {
            judul: seriesTitle,
            slug: await uniqueSlug(slugify(seriesTitle), (s) => seriesSlugExists(s)),
            cover: items[0]?.thumbnail ?? null,
            seriesTypeId: typeId,
            published: data.published,
          },
        });
        series = { id: created.id, judul: created.judul, slug: created.slug };
      }
    }

    if (!series) {
      return {
        ok: false,
        error: { code: "UNKNOWN_ERROR", message: "Gagal menentukan series target" },
      };
    }

    const CHUNK_SIZE = 200;
    for (let i = 0; i < audioRows.length; i += CHUNK_SIZE) {
      const chunk = audioRows.slice(i, i + CHUNK_SIZE);
      await prisma.$transaction(
        async (tx) => {
          for (const row of chunk) {
            await tx.audio.create({
              data: {
                seriesId: series.id,
                nomorSesi: baseNomorSesi + row.item.position,
                judul: row.judul,
                slug: row.slug,
                durasi: row.item.durationSeconds ?? 0,
                cover: row.item.thumbnail,
                published: data.published,
                mediaSources: {
                  create: {
                    provider: "YOUTUBE",
                    providerId: row.item.videoId,
                    url: `https://www.youtube.com/watch?v=${row.item.videoId}`,
                    metadata: {
                      embedUrl: `https://www.youtube.com/embed/${row.item.videoId}`,
                      thumbnail: row.item.thumbnail,
                    },
                  },
                },
              },
            });
            imported++;
          }
        },
        { timeout: 120000 },
      );
    }

    await recalcSeriesTotals(series.id);
    revalidatePublic();

    return {
      ok: true,
      data: {
        seriesId: series.id,
        seriesSlug: series.slug,
        seriesTitle: series.judul,
        imported,
        skippedDuplicates,
        skippedUnavailable,
        skippedSesiConflict,
        action,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: error instanceof Error ? error.message : "Gagal mengimpor playlist",
      },
    };
  }
}
