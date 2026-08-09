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
  skippedSesiConflict: number;
};

const confirmSchema = z.object({
  playlistUrl: z.string().trim().min(1, "URL playlist wajib diisi"),
  seriesTypeId: z.string().min(1, "Pilih kitab/tipe series"),
  published: z.boolean(),
  cleanTitles: z.boolean(),
  selectedVideoIds: z.array(z.string()).min(1, "Pilih minimal 1 video"),
});

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
 * Impor video playlist sebagai SERIES BARU + semua audionya.
 * Duplikat video (sudah dipakai audio lain) dan tabrakan nomor sesi dilewati
 * dan dilaporkan — bukan mengagalkan seluruh import.
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
    const items = result.items.filter((i) => selectedIds.has(i.videoId));
    if (items.length === 0) {
      return {
        ok: false,
        error: { code: "VALIDATION_ERROR", message: "Tidak ada video yang dipilih" },
      };
    }

    const seriesType = await prisma.seriesType.findUnique({
      where: { id: data.seriesTypeId },
      select: { id: true },
    });
    if (!seriesType) {
      return {
        ok: false,
        error: { code: "VALIDATION_ERROR", message: "Kitab/tipe series tidak ditemukan" },
      };
    }

    const seriesTitle = result.playlistTitle || "Playlist";
    const seriesSlug = await uniqueSlug(slugify(seriesTitle), (s) => seriesSlugExists(s));
    const seriesCover = items[0]?.thumbnail ?? null;

    const series = await prisma.series.create({
      data: {
        judul: seriesTitle,
        slug: seriesSlug,
        cover: seriesCover,
        seriesTypeId: data.seriesTypeId,
        published: data.published,
      },
    });

    const existingMedia = await prisma.mediaSource.findMany({
      where: { provider: "YOUTUBE", providerId: { in: items.map((i) => i.videoId) } },
      select: { providerId: true },
    });
    const duplicateIds = new Set(existingMedia.map((e) => e.providerId));

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

    await prisma.$transaction(async (tx) => {
      for (const row of audioRows) {
        await tx.audio.create({
          data: {
            seriesId: series.id,
            nomorSesi: row.item.position,
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
    });

    await recalcSeriesTotals(series.id);
    revalidatePublic();

    return {
      ok: true,
      data: {
        seriesId: series.id,
        seriesSlug,
        seriesTitle,
        imported,
        skippedDuplicates,
        skippedSesiConflict,
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
