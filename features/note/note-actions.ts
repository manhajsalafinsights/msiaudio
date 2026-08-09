import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/session";

/* ================================================================
   NOTE ACTIONS (catatan pribadi per audio, terikat posisi detik)
   ================================================================ */

export async function getNotesByAudio(audioId: string) {
  const user = await getCurrentUser();
  if (!user) return [];

  const notes = await prisma.note.findMany({
    where: { userId: user.id, audioId },
    orderBy: { positionSeconds: "asc" },
  });

  return notes;
}

export async function getUserNotes() {
  const user = await getCurrentUser();
  if (!user) return [];

  const notes = await prisma.note.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
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

  return notes;
}
