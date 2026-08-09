import type { PageResult } from "@/types/pagination";
import { NotFoundError } from "@/lib/errors/app-error";
import * as seriesRepository from "@/repositories/series-repository";

export function toPageResult<T>(
  items: T[],
  total: number,
  page: number,
  perPage: number,
): PageResult<T> {
  return {
    items,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

type SortKey =
  | "terbaru"
  | "terlama"
  | "az"
  | "za"
  | "durasi_asc"
  | "durasi_desc"
  | "terbanyak_audio";
type RepoSort =
  | "newest"
  | "oldest"
  | "title"
  | "title_desc"
  | "duration_asc"
  | "duration_desc"
  | "most_audio";

const SORT_MAP: Record<SortKey, RepoSort> = {
  terbaru: "newest",
  terlama: "oldest",
  az: "title",
  za: "title_desc",
  durasi_asc: "duration_asc",
  durasi_desc: "duration_desc",
  terbanyak_audio: "most_audio",
};

export type { SortKey };

export async function getSeriesBySlug(slug: string) {
  const series = await seriesRepository.findPublishedSeriesBySlug(slug);
  if (!series) throw new NotFoundError("Series tidak ditemukan");
  return series;
}

export async function getSeriesList(
  page: number,
  perPage: number,
  opts?: {
    q?: string;
    categoryId?: string;
    speakerId?: string;
    seriesTypeId?: string;
    tagId?: string;
    sort?: SortKey;
  },
) {
  const { items, total } = await seriesRepository.listPublishedSeries({
    page,
    perPage,
    q: opts?.q,
    categoryId: opts?.categoryId,
    speakerId: opts?.speakerId,
    seriesTypeId: opts?.seriesTypeId,
    tagId: opts?.tagId,
    sort: opts?.sort ? SORT_MAP[opts.sort] : "newest",
  });

  return toPageResult(items, total, page, perPage);
}

export async function getRecentSeries(limit = 8) {
  return seriesRepository.listSeriesForExplore(limit);
}

export async function searchSeries(q: string, limit?: number) {
  return seriesRepository.searchPublishedSeries({ q, limit });
}

export async function getRelatedSeries(
  series: {
    id: string;
    speakers: { speakerId: string }[];
    categories: { categoryId: string }[];
  },
  limit?: number,
) {
  const speakerIds = series.speakers.map((s) => s.speakerId);
  const categoryIds = series.categories.map((c) => c.categoryId);

  if (speakerIds.length === 0 && categoryIds.length === 0) return [];

  return seriesRepository.findRelatedSeries({
    seriesId: series.id,
    speakerIds,
    categoryIds,
    limit,
  });
}

export async function getSeriesSlugs() {
  return seriesRepository.listPublishedSeriesSlugs();
}
