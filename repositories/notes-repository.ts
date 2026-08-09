import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";

export const noteInclude = {
  audio: { select: { id: true, judul: true, slug: true, durasi: true } },
} satisfies Prisma.NoteInclude;

export type NoteWithAudio = Prisma.NoteGetPayload<{
  include: typeof noteInclude;
}>;

export async function listNotesByUser(userId: string, audioId: string) {
  return prisma.note.findMany({
    where: { userId, audioId },
    include: noteInclude,
    orderBy: { createdAt: "asc" },
  });
}

export async function listNotesByUserAll(userId: string) {
  return prisma.note.findMany({
    where: { userId },
    include: noteInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getNote(id: string, userId: string) {
  return prisma.note.findFirst({
    where: { id, userId },
    include: noteInclude,
  });
}

export async function createNote(
  userId: string,
  audioId: string,
  data: { positionSeconds: number; content: string },
) {
  return prisma.note.create({
    data: { userId, audioId, ...data },
  });
}

export async function updateNote(
  id: string,
  userId: string,
  data: { content?: string; positionSeconds?: number },
) {
  return prisma.note.update({
    where: { id },
    data,
  });
}

export async function deleteNote(id: string) {
  return prisma.note.delete({
    where: { id },
  });
}

export async function countByUser(userId: string) {
  return prisma.note.count({ where: { userId } });
}
