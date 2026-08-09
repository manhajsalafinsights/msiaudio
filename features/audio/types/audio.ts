import type { AudioCard, AudioDetail } from "@/repositories/audio-repository";

export type AudioWithDetails = AudioDetail;

export type AudioListItem = AudioCard;

export type AudioCardData = AudioCard;

export function toPaginatedAudios(
  items: AudioListItem[],
  total: number,
  page: number,
  perPage: number,
) {
  return {
    items,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}
