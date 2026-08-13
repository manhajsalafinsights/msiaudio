import type { MediaProvider } from "@prisma/client";

export type PlayerStatus = "idle" | "loading" | "buffering" | "playing" | "paused" | "ended" | "error";

/**
 * MediaSource adalah URL sumber audio yang disimpan di database.
 * Admin hanya menempelkan URL, tidak upload file.
 *
 * Contoh:
 * - YouTube: https://www.youtube.com/watch?v=xxxxx
 * - Cloudflare R2: https://r2.example.com/audio/xxxxx.mp3
 * - BunnyCDN: https://cdn.example.com/audio/xxxxx.mp3
 * - Supabase Storage: https://xxxx.supabase.co/storage/v1/object/public/audio/xxxxx.mp3
 */
export interface MediaSource {
  provider: MediaProvider;
  url: string;
  providerId?: string;
  /** Metadata tambahan provider (mis. statistik view YouTube). */
  metadata?: unknown;
}

/**
 * ResolvedSource adalah URL final yang siap diputar oleh player.
 * Berisi URL yang sudah dipilih berdasarkan prioritas provider.
 */
export interface ResolvedSource {
  provider: MediaProvider;
  url: string;
  /** Untuk YouTube berisi video ID, untuk direct URL berisi null */
  providerId?: string;
}

export interface PlayerAudio {
  id: string;
  slug: string;
  judul: string;
  deskripsi: string | null;
  durasi: number;
  cover: string | null;
  nomorSesi: number;
  /** Kunjungan pengguna aplikasi (track-view), ditambah view YouTube di metadata media source. */
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  series: {
    id: string;
    judul: string;
    slug: string;
    cover: string | null;
    totalSesi: number;
    totalDurasi: number;
    seriesType: { nama: string };
    speakers: { speaker: { id: string; nama: string; slug: string; foto: string | null } }[];
  };
  mediaSources: MediaSource[];
  chapters?: { id: string; title: string; startSecond: number }[];
  highlights?: { id: string; title: string; startSecond: number }[];
  references?: {
    id: string;
    startSecond: number;
    endSecond: number | null;
    type: "QURAN" | "HADITH" | "KITAB" | "ARTICLE" | "QUOTE" | "NOTE";
    title: string | null;
    reference: string | null;
    content: string | null;
  }[];
}

export interface PlayerQueueItem {
  audio: PlayerAudio;
  position: number;
}

export interface PlayerConfig {
  speed: number;
  volume: number;
  muted: boolean;
  sleepTimer: number | null;
}

export interface PlayerState {
  currentAudio: PlayerAudio | null;
  queue: PlayerQueueItem[];
  currentQueueIndex: number;
  status: PlayerStatus;
  position: number;
  duration: number;
  config: PlayerConfig;
  error: string | null;
}

export interface PlayerActions {
  loadAudio: (audio: PlayerAudio, queue?: PlayerQueueItem[]) => void;
  play: () => void;
  pause: () => void;
  seek: (position: number) => void;
  setSpeed: (speed: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setSleepTimer: (minutes: number | null) => void;
  next: () => void;
  previous: () => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export type PlayerStore = PlayerState & {
  actions: PlayerActions;
};

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 1.75, 2] as const;
export type SpeedOption = (typeof SPEED_OPTIONS)[number];

export const SPEED_OPTIONS_ARRAY: SpeedOption[] = [...SPEED_OPTIONS];

const SLEEP_TIMER_OPTIONS = [5, 10, 15, 30, 45, 60, 90] as const;
export type SleepTimerOption = (typeof SLEEP_TIMER_OPTIONS)[number];

export const SLEEP_TIMER_OPTIONS_ARRAY: SleepTimerOption[] = [...SLEEP_TIMER_OPTIONS];

export type { MediaProvider };
