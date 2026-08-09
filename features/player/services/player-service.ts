import { cache } from "react";
import type { MediaProvider } from "@prisma/client";
import { NotFoundError } from "@/lib/errors/app-error";
import type {
  MediaSource,
  PlayerAudio,
  PlayerQueueItem,
  ResolvedSource,
} from "@/features/player/types/player";
import * as audioRepository from "@/repositories/audio-repository";
import type { AudioDetail } from "@/repositories/audio-repository";

/** Sumber ringan satu item queue player (tanpa include series/speaker penuh). */
type PlayerQueueSource = Awaited<
  ReturnType<typeof audioRepository.listPublishedAudioQueueBySeries>
>[number];

/**
 * Prioritas provider audio.
 * Provider di urutan atas dipilih terlebih dahulu.
 *
 * Tambah provider baru? Cukup tambahkan ke enum MediaProvider di Prisma schema
 * dan atur prioritasnya di sini.
 */
const PROVIDER_PRIORITY: readonly MediaProvider[] = [
  "YOUTUBE",
  "CLOUDFLARE_R2",
  "BUNNY_CDN",
  "BACKBLAZE",
] as const;

/**
 * Memilih sumber audio terbaik berdasarkan prioritas provider.
 *
 * Contoh:
 * - Jika ada YouTube, pilih YouTube.
 * - Jika tidak ada YouTube, pilih Cloudflare R2.
 * - Jika tidak ada R2, pilih BunnyCDN, dst.
 *
 * @param sources - Daftar URL sumber audio dari database
 * @returns ResolvedSource | null jika tidak ada sumber
 */
export function resolveBestSource(sources: MediaSource[]): ResolvedSource | null {
  if (sources.length === 0) return null;

  for (const provider of PROVIDER_PRIORITY) {
    const source = sources.find((s) => s.provider === provider);
    if (source) {
      return {
        provider: source.provider,
        url: source.url,
        providerId: source.providerId,
      };
    }
  }

  // Fallback: gunakan sumber apapun yang ada
  const fallback = sources[0];
  return {
    provider: fallback.provider,
    url: fallback.url,
    providerId: fallback.providerId,
  };
}

/**
 * Membuat URL embed/play dari provider tertentu.
 * Setiap provider punya cara berbeda untuk memutar audio.
 *
 * - YouTube: menggunakan IFrame API (video ID dari URL)
 * - Direct URL (R2, BunnyCDN, Supabase, S3): langsung ke URL file audio
 */
export function buildPlayableUrl(source: ResolvedSource): string {
  switch (source.provider) {
    case "YOUTUBE":
      return source.providerId ?? extractYouTubeId(source.url) ?? source.url;
    case "CLOUDFLARE_R2":
    case "BUNNY_CDN":
    case "BACKBLAZE":
    default:
      return source.url;
  }
}

/**
 * Mengekstrak video ID dari URL YouTube.
 * Support format:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 */
function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      return parsed.searchParams.get("v");
    }
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1);
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Mengecek apakah video YouTube bisa di-embed.
 * Menggunakan YouTube oEmbed API.
 */
export async function checkVideoEmbeddable(videoId: string): Promise<{
  embeddable: boolean;
  title?: string;
  error?: string;
}> {
  try {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(url);

    if (!response.ok) {
      return {
        embeddable: false,
        error: "Video tidak ditemukan atau tidak bisa di-embed",
      };
    }

    const data = await response.json();
    return {
      embeddable: true,
      title: data.title,
    };
  } catch {
    return {
      embeddable: false,
      error: "Gagal memeriksa video",
    };
  }
}

/**
 * Mengecek apakah sumber adalah YouTube (memerlukan IFrame API).
 */
export function isYouTubeSource(source: ResolvedSource): boolean {
  return source.provider === "YOUTUBE";
}

/**
 * Mengecek apakah sumber adalah direct URL (langsung bisa diputar).
 */
export function isDirectUrlSource(source: ResolvedSource): boolean {
  return !isYouTubeSource(source);
}

/**
 * Convert raw Prisma Audio ke PlayerAudio type.
 */
export function toPlayerAudio(audio: AudioDetail): PlayerAudio {
  return {
    id: audio.id,
    slug: audio.slug,
    judul: audio.judul,
    deskripsi: audio.deskripsi,
    durasi: audio.durasi,
    cover: audio.cover,
    nomorSesi: audio.nomorSesi,
    createdAt: audio.createdAt,
    updatedAt: audio.updatedAt,
    series: {
      id: audio.series.id,
      judul: audio.series.judul,
      slug: audio.series.slug,
      cover: audio.series.cover,
      totalSesi: audio.series.totalSesi,
      totalDurasi: audio.series.totalDurasi,
      seriesType: { nama: audio.series.seriesType.nama },
      speakers: audio.series.speakers.map((s) => ({
        speaker: {
          id: s.speaker.id,
          nama: s.speaker.nama,
          slug: s.speaker.slug,
          foto: s.speaker.foto,
        },
      })),
    },
    mediaSources: audio.mediaSources.map((ms) => ({
      provider: ms.provider,
      url: ms.url,
      providerId: ms.providerId,
    })),
    chapters: audio.chapters
      ? audio.chapters.map((c) => ({
          id: c.id,
          title: c.title,
          startSecond: c.startSecond,
        }))
      : [],
    highlights: audio.highlights
      ? audio.highlights.map((h) => ({
          id: h.id,
          title: h.title,
          startSecond: h.startSecond,
        }))
      : [],
    references: audio.references
      ? audio.references.map((r) => ({
          id: r.id,
          startSecond: r.startSecond,
          endSecond: r.endSecond,
          type: r.type,
          title: r.title,
          reference: r.reference,
          content: r.content,
        }))
      : [],
  };
}

/**
 * Build queue dari daftar audio dalam satu series.
 * Menerima item ringan (tanpa include nested) + metadata series yang sama
 * untuk seluruh item, sehingga queue tidak perlu fetch ulang series per baris.
 */
export function buildPlayerQueue(
  allAudio: PlayerQueueSource[],
  currentAudioId: string,
  series: PlayerAudio["series"],
): { queue: PlayerQueueItem[]; currentQueueIndex: number } {
  const playerAudios = allAudio.map((audio, index) => ({
    audio: {
      id: audio.id,
      slug: audio.slug,
      judul: audio.judul,
      deskripsi: audio.deskripsi,
      durasi: audio.durasi,
      cover: audio.cover,
      nomorSesi: audio.nomorSesi,
      createdAt: audio.createdAt,
      updatedAt: audio.updatedAt,
      series,
      mediaSources: audio.mediaSources.map((ms) => ({
        provider: ms.provider,
        url: ms.url,
        providerId: ms.providerId,
      })),
    } satisfies PlayerAudio,
    position: index,
  }));

  const currentQueueIndex = playerAudios.findIndex((item) => item.audio.id === currentAudioId);

  return {
    queue: playerAudios,
    currentQueueIndex: currentQueueIndex >= 0 ? currentQueueIndex : 0,
  };
}

/**
 * Result dari getPlayerContext.
 * Hanya berisi URL yang siap diputar, bukan file.
 */
export interface PlayerContext {
  audio: PlayerAudio;
  queue: PlayerQueueItem[];
  currentQueueIndex: number;
  /** URL final yang siap diputar, sudah dipilih berdasarkan prioritas */
  resolvedSource: ResolvedSource | null;
}

/**
 * Fetch konteks lengkap untuk player.
 * Ini adalah entry point utama untuk memuat data player.
 */
export const getPlayerContext = cache(async (audioSlug: string): Promise<PlayerContext> => {
  const audio = await audioRepository.findPublishedAudioBySlug(audioSlug);
  if (!audio) throw new NotFoundError("Audio tidak ditemukan");

  const allAudio = await audioRepository.listPublishedAudioQueueBySeries(audio.seriesId);
  const { queue, currentQueueIndex } = buildPlayerQueue(
    allAudio,
    audio.id,
    toPlayerAudio(audio).series,
  );

  const mediaSources: MediaSource[] = audio.mediaSources.map((ms) => ({
    provider: ms.provider,
    url: ms.url,
    providerId: ms.providerId,
  }));

  const resolvedSource = resolveBestSource(mediaSources);

  return {
    audio: toPlayerAudio(audio),
    queue,
    currentQueueIndex,
    resolvedSource,
  };
});

/**
 * Get audio by slug (simple lookup, used for preloads).
 */
export async function getAudioBySlug(slug: string): Promise<PlayerAudio> {
  const audio = await audioRepository.findPublishedAudioBySlug(slug);
  if (!audio) throw new NotFoundError("Audio tidak ditemukan");
  return toPlayerAudio(audio);
}

/**
 * Get series audio list untuk queue building.
 */
export async function getSeriesAudioList(seriesId: string): Promise<PlayerAudio[]> {
  const audioList = await audioRepository.listPublishedAudioBySeries(seriesId);
  return audioList.map((audio) => toPlayerAudio(audio as AudioDetail));
}
