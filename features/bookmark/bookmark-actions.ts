import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/session";

/* ================================================================
   BOOKMARK ACTIONS
   ================================================================ */

export async function toggleBookmark(audioId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const existing = await prisma.bookmark.findUnique({
    where: { userId_audioId: { userId: user.id, audioId } },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    return { bookmarked: false };
  }

  await prisma.bookmark.create({
    data: { userId: user.id, audioId },
  });

  return { bookmarked: true };
}

export async function isBookmarked(audioId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const bookmark = await prisma.bookmark.findUnique({
    where: { userId_audioId: { userId: user.id, audioId } },
    select: { id: true },
  });

  return Boolean(bookmark);
}

export async function getUserBookmarks() {
  const user = await getCurrentUser();
  if (!user) return [];

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      audio: {
        select: {
          id: true,
          judul: true,
          slug: true,
          durasi: true,
          cover: true,
          series: { select: { judul: true, slug: true } },
        },
      },
    },
  });

  return bookmarks.map((b) => b.audio);
}