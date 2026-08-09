import { NotFoundError } from "@/lib/errors/app-error";
import * as notesRepository from "@/repositories/notes-repository";

export async function listNotesByUser(userId: string, audioId: string) {
  return notesRepository.listNotesByUser(userId, audioId);
}

export async function listNotesByUserAll(userId: string) {
  return notesRepository.listNotesByUserAll(userId);
}

export async function getNote(id: string, userId: string) {
  const note = await notesRepository.getNote(id, userId);
  if (!note) throw new NotFoundError("Catatan tidak ditemukan");
  return note;
}

export async function createNote(
  userId: string,
  audioId: string,
  data: { positionSeconds: number; content: string },
) {
  return notesRepository.createNote(userId, audioId, data);
}

export async function updateNote(
  id: string,
  userId: string,
  data: { content?: string; positionSeconds?: number },
) {
  return notesRepository.updateNote(id, userId, data);
}

export async function deleteNote(id: string) {
  await notesRepository.deleteNote(id);
}

export async function countByUser(userId: string) {
  return notesRepository.countByUser(userId);
}
