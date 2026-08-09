import { NotFoundError } from "@/lib/errors/app-error";
import * as speakerRepository from "@/repositories/speaker-repository";

export async function listActiveSpeakers() {
  return speakerRepository.listActiveSpeakers();
}

export async function getSpeakerBySlug(slug: string) {
  const speaker = await speakerRepository.getSpeakerBySlug(slug);
  if (!speaker) throw new NotFoundError("Ustadz tidak ditemukan");
  return speaker;
}

export async function getSpeakerById(id: string) {
  const speaker = await speakerRepository.getSpeakerById(id);
  if (!speaker) throw new NotFoundError("Ustadz tidak ditemukan");
  return speaker;
}

export async function speakerExists(slug: string) {
  return speakerRepository.speakerExists(slug);
}
