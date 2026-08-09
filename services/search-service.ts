import * as audioRepository from "@/repositories/audio-repository";
import * as seriesRepository from "@/repositories/series-repository";
import * as seriesTypeRepository from "@/repositories/series-type-repository";
import * as speakerRepository from "@/repositories/speaker-repository";
import { toPageResult } from "@/services/series-service";
import type { AudioCard } from "@/repositories/audio-repository";
import type { SeriesPublic } from "@/repositories/series-repository";

export type SearchGroupResult = {
  q: string;
  series: SeriesPublic[];
  totalSeries: number;
  kitab: {
    id: string;
    nama: string;
    slug: string;
    seriesCount: number;
  }[];
  totalKitab: number;
  audio: AudioCard[];
  totalAudio: number;
  speakers: {
    id: string;
    nama: string;
    slug: string;
    foto: string | null;
    bio: string | null;
  }[];
  totalSpeakers: number;
};

/** Batas item per grup pada halaman pencarian. */
export const SEARCH_GROUP_LIMITS = {
  series: 6,
  kitab: 6,
  audio: 10,
  speakers: 6,
} as const;

/**
 * Pencarian global — hasil dikelompokkan per tipe konten.
 * Semua query memakai batas (take) dan hanya konten published.
 */
export async function getSearchGroups(q: string): Promise<SearchGroupResult> {
  const query = q.trim();

  const [series, audio, kitab, speakers] = await Promise.all([
    seriesRepository.searchPublishedSeries({
      q: query,
      limit: SEARCH_GROUP_LIMITS.series,
    }),
    audioRepository.listPublishedAudioFiltered({
      q: query,
      perPage: SEARCH_GROUP_LIMITS.audio,
      sort: "newest",
    }),
    seriesTypeRepository.searchSeriesTypes(query, SEARCH_GROUP_LIMITS.kitab),
    speakerRepository.searchSpeakers(query, SEARCH_GROUP_LIMITS.speakers),
  ]);

  return {
    q: query,
    series,
    totalSeries: await seriesRepository.countPublishedSeries(query),
    kitab: kitab.map((k) => ({
      id: k.id,
      nama: k.nama,
      slug: k.slug,
      seriesCount: k._count.series,
    })),
    totalKitab: await seriesTypeRepository.countSearchSeriesTypes(query),
    audio: audio.items,
    totalAudio: audio.total,
    speakers: speakers.map((s) => ({
      id: s.id,
      nama: s.nama,
      slug: s.slug,
      foto: s.foto,
      bio: s.bio,
    })),
    totalSpeakers: await speakerRepository.countSearchSpeakers(query),
  };
}

export type AudioSortKey =
  | "terbaru"
  | "terlama"
  | "az"
  | "za"
  | "durasi_asc"
  | "durasi_desc";

const AUDIO_SORT_MAP: Record<AudioSortKey, "newest" | "oldest" | "title" | "title_desc" | "duration_asc" | "duration_desc"> = {
  terbaru: "newest",
  terlama: "oldest",
  az: "title",
  za: "title_desc",
  durasi_asc: "duration_asc",
  durasi_desc: "duration_desc",
};

type AudioBrowseFilters = {
  q?: string;
  seriesId?: string;
  seriesTypeId?: string;
  speakerId?: string;
  categoryId?: string;
  tagId?: string;
  duration?: audioRepository.DurationBucket;
  sort?: AudioSortKey;
};

export async function getFilteredAudioList(
  page: number,
  perPage: number,
  filters: AudioBrowseFilters,
) {
  const { items, total } = await audioRepository.listPublishedAudioFiltered({
    page,
    perPage,
    ...filters,
    sort: filters.sort ? AUDIO_SORT_MAP[filters.sort] : "newest",
  });
  return toPageResult(items, total, page, perPage);
}
