import { NotFoundError } from "@/lib/errors/app-error";
import * as audioRepository from "@/repositories/audio-repository";

export async function getRecentAudio(limit = 8, seriesTypeSlug = "tematik") {
  return audioRepository.listRecentPublishedAudio(limit, seriesTypeSlug);
}

/**
 * Promosi "Pilihan Untuk Belajar" — satu audio andalan per jenis konten.
 * Kategori yang belum punya audio diabaikan (tanpa error).
 */
export async function getPromoLearningAudios() {
  const entries = [
    { slug: "kajian-kitab", label: "Kajian Kitab" },
    { slug: "murotal", label: "Murotal" },
    { slug: "kitab-bahasa-arab", label: "Belajar Bahasa Arab" },
  ];

  const items = await Promise.all(
    entries.map(async (entry) => {
      const audio = await audioRepository.findLatestAudioBySeriesTypeSlug(entry.slug);
      return audio ? { label: entry.label, audio } : null;
    }),
  );

  return items.filter((item): item is NonNullable<typeof item> => item !== null);
}

export async function getAudioBySlug(slug: string) {
  const audio = await audioRepository.findPublishedAudioBySlug(slug);
  if (!audio) throw new NotFoundError("Audio tidak ditemukan");
  return audio;
}

export async function getSeriesAudioList(seriesId: string) {
  return audioRepository.listPublishedAudioBySeries(seriesId);
}

export async function searchAudio(q: string, limit?: number) {
  return audioRepository.searchPublishedAudio(q, limit);
}

export async function getAdjacentAudio(seriesId: string, currentNomorSesi: number) {
  return audioRepository.findAdjacentAudio(seriesId, currentNomorSesi);
}

export async function getRelatedAudioBySeries(audioId: string, seriesId: string, limit = 6) {
  return audioRepository.listRelatedAudio(seriesId, audioId, limit);
}

export async function getAudioBySameSpeaker(
  speakerIds: string[],
  excludeSeriesId: string,
  limit = 6,
) {
  if (speakerIds.length === 0) return [];
  return audioRepository.listAudioBySameSpeaker(speakerIds, excludeSeriesId, limit);
}
