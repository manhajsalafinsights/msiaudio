import { prisma } from "@/lib/prisma/client";
import type { TranscriptSegment } from "@/utils/youtube-captions";

export type TranscriptRecord = {
  id: string;
  audioId: string;
  language: string;
  provider: string;
  status: string;
  content: string | null;
  segments: TranscriptSegment[] | null;
  updatedAt: Date;
};

/** Ambil transkrip untuk sebuah audio. */
export async function getTranscriptByAudio(audioId: string): Promise<TranscriptRecord | null> {
  const row = await prisma.transcript.findFirst({
    where: { audioId },
    orderBy: { updatedAt: "desc" },
  });
  if (!row) return null;
  return {
    id: row.id,
    audioId: row.audioId,
    language: row.language,
    provider: row.provider,
    status: row.status,
    content: row.content,
    segments: Array.isArray(row.segments)
      ? (row.segments as TranscriptSegment[])
      : null,
    updatedAt: row.updatedAt,
  };
}
