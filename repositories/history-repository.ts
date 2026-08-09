import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";

export const historyInclude = {
  audio: {
    select: {
      id: true,
      judul: true,
      slug: true,
      durasi: true,
      cover: true,
      published: true,
      series: { select: { id: true, judul: true, slug: true } },
    },
  },
} satisfies Prisma.ListeningHistoryInclude;

export type HistoryWithAudio = Prisma.ListeningHistoryGetPayload<{
  include: typeof historyInclude;
}>;

export async function getListeningState(userId: string, audioId: string) {
  return prisma.listeningHistory.findUnique({
    where: { userId_audioId: { userId, audioId } },
    include: historyInclude,
  });
}

export async function listHistoryByUser(userId: string, opts: { page: number; perPage: number }) {
  const where = { userId };
  const [total, items] = await prisma.$transaction([
    prisma.listeningHistory.count({ where }),
    prisma.listeningHistory.findMany({
      where,
      include: historyInclude,
      orderBy: { lastPlayedAt: "desc" },
      skip: (opts.page - 1) * opts.perPage,
      take: opts.perPage,
    }),
  ]);
  return { items, total };
}

export async function upsertListeningState(
  userId: string,
  audioId: string,
  data: {
    positionSeconds?: number;
    progressPercent?: number;
    completed?: boolean;
    playCount?: number;
  },
) {
  return prisma.listeningHistory.upsert({
    where: { userId_audioId: { userId, audioId } },
    create: { userId, audioId, ...data },
    update: data,
  });
}

export async function countByUser(userId: string) {
  return prisma.listeningHistory.count({ where: { userId } });
}
