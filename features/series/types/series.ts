import type { SeriesDetail, SeriesPublic } from "@/repositories/series-repository";
import type { PageResult } from "@/types/pagination";

export type SeriesWithDetails = SeriesDetail;

export type SeriesListItem = SeriesPublic;

export type SeriesListResponse = PageResult<SeriesListItem>;

export type SeriesCardData = SeriesPublic;

export function toSeriesListResponse(
  items: SeriesListItem[],
  total: number,
  page: number,
  perPage: number,
): SeriesListResponse {
  return {
    items,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}
