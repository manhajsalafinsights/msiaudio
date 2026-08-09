import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";

export const progressInclude = {
  series: { select: { id: true, judul: true, slug: true, cover: true } },
  lastAudio: { select: { id: true, judul: true, slug: true, durasi: true } },
} satisfies Prisma.UserProgressInclude;

export type ProgressWithSeries = Prisma.UserProgressGetPayload<{
  include: typeof progressInclude;
}>;

export async function getProgress(userId: string, seriesId: string) {
  return prisma.userProgress.findUnique({
    where: { userId_seriesId: { userId, seriesId } },
    include: progressInclude,
  });
}

export async function listProgressByUser(userId: string) {
  return prisma.userProgress.findMany({
    where: { userId },
    include: progressInclude,
    orderBy: { updatedAt: "desc" },
  });
}

export async function upsertProgress(
  userId: string,
  seriesId: string,
  data: {
    lastAudioId?: string;
    positionSeconds?: number;
    completedCount?: number;
    progressPercent?: number;
  },
) {
  return prisma.userProgress.upsert({
    where: { userId_seriesId: { userId, seriesId } },
    create: { userId, seriesId, ...data },
    update: data,
  });
}

export async function countByUser(userId: string) {
  return prisma.userProgress.count({ where: { userId } });
}

/* ================================================================
   PUBLIK (Phase 11 — tampilan progress di halaman browse)
   ================================================================ */

export type SeriesProgressBrief = {
  seriesId: string;
  completedCount: number;
  progressPercent: number;
  lastAudioId: string | null;
};

/** Progress series untuk banyak series sekaligus (untuk grid kartu). */
export async function getProgressBySeriesIds(
  userId: string,
  seriesIds: string[],
): Promise<SeriesProgressBrief[]> {
  if (seriesIds.length === 0) return [];
  return prisma.userProgress.findMany({
    where: { userId, seriesId: { in: seriesIds } },
    select: { seriesId: true, completedCount: true, progressPercent: true, lastAudioId: true },
  });
}

export type AudioListeningBrief = {
  audioId: string;
  completed: boolean;
  progressPercent: number;
};

/** Status mendengarkan untuk banyak audio sekaligus (daftar sesi). */
export async function getListeningByAudioIds(
  userId: string,
  audioIds: string[],
): Promise<AudioListeningBrief[]> {
  if (audioIds.length === 0) return [];
  return prisma.listeningHistory.findMany({
    where: { userId, audioId: { in: audioIds } },
    select: { audioId: true, completed: true, progressPercent: true },
  });
}
