import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/session";

/* ================================================================
   PROGRESS ACTIONS
   ================================================================ */

export async function getContinueLearning(limit = 5) {
  const user = await getCurrentUser();
  if (!user) return [];

  const progress = await prisma.userProgress.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      series: {
        select: { id: true, judul: true, slug: true, cover: true, totalSesi: true },
      },
      lastAudio: {
        select: { id: true, judul: true, slug: true, nomorSesi: true, durasi: true },
      },
    },
  });

  return progress.filter((p) => p.lastAudio !== null);
}

export async function getListeningHistory(limit = 50) {
  const user = await getCurrentUser();
  if (!user) return [];

  const history = await prisma.listeningHistory.findMany({
    where: { userId: user.id },
    orderBy: { lastPlayedAt: "desc" },
    take: limit,
    include: {
      audio: {
        select: {
          id: true,
          judul: true,
          slug: true,
          durasi: true,
          cover: true,
          nomorSesi: true,
          series: { select: { judul: true, slug: true } },
        },
      },
    },
  });

  return history;
}

export async function getUserDashboardStats() {
  const user = await getCurrentUser();
  if (!user) {
    return { totalAudio: 0, totalDuration: 0, completedAudio: 0, seriesInProgress: 0 };
  }

  const [history, progress] = await Promise.all([
    prisma.listeningHistory.findMany({
      where: { userId: user.id },
      select: { completed: true, playCount: true, audio: { select: { durasi: true } } },
    }),
    prisma.userProgress.count({ where: { userId: user.id } }),
  ]);

  const totalDuration = history.reduce((sum, h) => sum + h.audio.durasi, 0);
  const completedAudio = history.filter((h) => h.completed).length;

  return {
    totalAudio: history.length,
    totalDuration,
    completedAudio,
    seriesInProgress: progress,
  };
}
