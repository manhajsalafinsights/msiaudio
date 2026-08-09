import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";

export const bookmarkInclude = {
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
} satisfies Prisma.BookmarkInclude;

export type BookmarkWithAudio = Prisma.BookmarkGetPayload<{
  include: typeof bookmarkInclude;
}>;

export async function listBookmarksByUser(userId: string) {
  return prisma.bookmark.findMany({
    where: { userId },
    include: bookmarkInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getBookmark(userId: string, audioId: string) {
  return prisma.bookmark.findUnique({
    where: { userId_audioId: { userId, audioId } },
  });
}

export async function createBookmark(userId: string, audioId: string) {
  return prisma.bookmark.create({
    data: { userId, audioId },
  });
}

export async function deleteBookmark(userId: string, audioId: string) {
  return prisma.bookmark.delete({
    where: { userId_audioId: { userId, audioId } },
  });
}

export async function countByUser(userId: string) {
  return prisma.bookmark.count({ where: { userId } });
}
