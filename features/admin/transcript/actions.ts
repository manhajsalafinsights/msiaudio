"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/client";
import { requireAdmin } from "@/lib/auth/session";
import type { ActionState } from "@/types/action";
import {
  fetchYouTubeCaptions,
  segmentsToPlainText,
  type TranscriptSegment,
} from "@/utils/youtube-captions";

export type TranscriptFetchResult = {
  languageCode: string;
  languageName: string;
  segmentCount: number;
};

/** Ambil caption YouTube untuk sebuah audio lalu simpan sebagai transkrip. */
export async function fetchTranscriptFromYouTube(
  audioId: string,
): Promise<ActionState<TranscriptFetchResult>> {
  try {
    await requireAdmin();

    const audio = await prisma.audio.findUnique({
      where: { id: audioId },
      select: {
        slug: true,
        mediaSources: {
          where: { provider: "YOUTUBE" },
          take: 1,
          select: { providerId: true },
        },
      },
    });
    const videoId = audio?.mediaSources[0]?.providerId;
    if (!videoId) {
      return {
        ok: false,
        error: {
          code: "NO_VIDEO",
          message: "Audio tidak memiliki sumber YouTube. Tambahkan URL YouTube dulu.",
        },
      };
    }

    const result = await fetchYouTubeCaptions(videoId);
    if (!result.ok) return { ok: false, error: result.error };

    const segments = result.segments.map((s: TranscriptSegment) => ({
      start: Number(s.start.toFixed(3)),
      end: Number(s.end.toFixed(3)),
      text: s.text,
    }));

    const language = result.languageCode || "id";
    await prisma.transcript.upsert({
      where: { audioId_language: { audioId, language } },
      create: {
        audioId,
        language,
        provider: "YOUTUBE",
        content: segmentsToPlainText(segments),
        segments: segments as unknown as object,
        status: "COMPLETED",
      },
      update: {
        provider: "YOUTUBE",
        content: segmentsToPlainText(segments),
        segments: segments as unknown as object,
        status: "COMPLETED",
      },
    });

    revalidatePath(`/audio/${audio.slug}`);
    revalidatePath("/", "layout");

    return {
      ok: true,
      data: {
        languageCode: result.languageCode,
        languageName: result.languageName,
        segmentCount: segments.length,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: error instanceof Error ? error.message : "Gagal mengambil transkrip",
      },
    };
  }
}

/** Hapus transkrip audio (semua bahasa). */
export async function clearTranscript(
  audioId: string,
): Promise<ActionState<{ deleted: number }>> {
  try {
    await requireAdmin();
    const audio = await prisma.audio.findUnique({
      where: { id: audioId },
      select: { slug: true },
    });
    const deleted = await prisma.transcript.deleteMany({ where: { audioId } });
    if (audio) revalidatePath(`/audio/${audio.slug}`);
    revalidatePath("/", "layout");
    return { ok: true, data: { deleted: deleted.count } };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: error instanceof Error ? error.message : "Gagal menghapus transkrip",
      },
    };
  }
}
