"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import type { ActionState } from "@/types/action";
import { resolveChannelId, fetchChannelPlaylists } from "@/utils/youtube-channel";
import { fetchYouTubePlaylist } from "@/utils/youtube-playlist";
import { importPlaylistAsSeries, type ImportSummary } from "@/features/admin/playlist/actions";
import { isUnavailableVideo } from "@/features/admin/playlist/video-utils";

export type ChannelPreview = {
  channelId: string;
  channelTitle: string;
  playlists: { id: string; title: string; itemCount: number }[];
  truncated: boolean;
};

export type ChannelPlaylistResult = {
  playlistId: string;
  playlistTitle: string;
  ok: boolean;
  message?: string;
  seriesId?: string;
  seriesSlug?: string;
  imported?: number;
  skippedDuplicates?: number;
  skippedUnavailable?: number;
};

const importChannelSchema = z.object({
  playlistIds: z.array(z.string().min(1)).min(1, "Pilih minimal 1 playlist"),
  seriesTypeId: z.string().min(1, "Pilih kitab / tipe series"),
  published: z.boolean(),
  cleanTitles: z.boolean(),
});

/** Preview: resolve link channel → daftar seluruh playlist-nya. */
export async function previewChannel(url: string): Promise<ActionState<ChannelPreview>> {
  try {
    await requireAdmin();
    const resolved = await resolveChannelId(url);
    if (!resolved.ok) return { ok: false, error: resolved.error };

    const data = await fetchChannelPlaylists(resolved.channelId);
    if (data.playlists.length === 0) {
      return {
        ok: false,
        error: { code: "EMPTY", message: "Channel ini tidak memiliki playlist publik." },
      };
    }
    return {
      ok: true,
      data: {
        channelId: resolved.channelId,
        channelTitle: data.channelTitle,
        playlists: data.playlists,
        truncated: data.truncated,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: error instanceof Error ? error.message : "Gagal memuat playlist channel",
      },
    };
  }
}

/**
 * Import seluruh playlist terpilih sebagai SERIES BARU (judul series = judul playlist).
 * Video private/deleted & duplikat dilewati otomatis (dilaporkan per playlist).
 */
export async function importChannelPlaylists(input: z.infer<typeof importChannelSchema>): Promise<
  ActionState<ChannelPlaylistResult[]>
> {
  try {
    await requireAdmin();
    const parsed = importChannelSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      };
    }
    const { playlistIds, seriesTypeId, published, cleanTitles } = parsed.data;
    if (playlistIds.length > 500) {
      return {
        ok: false,
        error: { code: "VALIDATION_ERROR", message: "Maksimal 500 playlist dalam sekali jalankan" },
      };
    }

    const results: ChannelPlaylistResult[] = [];
    for (const playlistId of playlistIds) {
      const fetched = await fetchYouTubePlaylist(playlistId);
      if (!fetched.ok) {
        results.push({
          playlistId,
          playlistTitle: playlistId,
          ok: false,
          message: fetched.error.message,
        });
        continue;
      }
      const usable = fetched.items.filter((i) => !isUnavailableVideo(i.title));
      if (usable.length === 0) {
        results.push({
          playlistId,
          playlistTitle: fetched.playlistTitle || playlistId,
          ok: false,
          message: "Tidak ada video yang bisa diimpor (kosong / private)",
        });
        continue;
      }

      const importRes = await importPlaylistAsSeries({
        playlistUrl: playlistId,
        mode: "new",
        seriesTypeId,
        published,
        cleanTitles,
        selectedVideoIds: usable.map((i) => i.videoId),
      });
      if (!importRes.ok) {
        results.push({
          playlistId,
          playlistTitle: fetched.playlistTitle || playlistId,
          ok: false,
          message: importRes.error.message,
        });
        continue;
      }
      const s: ImportSummary = importRes.data;
      results.push({
        playlistId,
        playlistTitle: s.seriesTitle,
        ok: true,
        seriesId: s.seriesId,
        seriesSlug: s.seriesSlug,
        imported: s.imported,
        skippedDuplicates: s.skippedDuplicates,
        skippedUnavailable: s.skippedUnavailable,
      });
    }

    revalidatePath("/", "layout");
    return { ok: true, data: results };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: error instanceof Error ? error.message : "Gagal mengimpor playlist channel",
      },
    };
  }
}