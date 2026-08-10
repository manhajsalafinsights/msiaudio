"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ResolvedSource } from "@/features/player/types/player";
import { resolveBestSource } from "@/features/player/services/player-service";
import { usePlayerStore } from "@/features/player/store/player-store";

const isDevelopment = process.env.NODE_ENV === "development";

function log(...args: unknown[]) {
  if (isDevelopment) {
    console.log("[Player]", ...args);
  }
}

function logError(...args: unknown[]) {
  if (isDevelopment) {
    console.error("[Player]", ...args);
  }
}

declare global {
  interface Window {
    YT: YTGlobal;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(second: number, allowSeekAhead?: boolean): void;
  getPlayerState(): number;
  getCurrentTime(): number;
  getDuration(): number;
  getVideoData(): { video_id: string };
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  setVolume(volume: number): void;
  getVolume(): number;
  setPlaybackRate(rate: number): void;
  getPlaybackRate(): number;
  cueVideoById(videoId: string): void;
  loadVideoById(videoId: string): void;
  addEventListener(event: string, handler: (...args: unknown[]) => void): void;
  removeEventListener(event: string, handler: (...args: unknown[]) => void): void;
  destroy(): void;
}

type YTPlayerConstructor = new (
  id: string | HTMLElement,
  config: {
    height?: string;
    width?: string;
    videoId?: string;
    playerVars?: Record<string, unknown>;
    events: {
      onReady: (evt: unknown) => void;
      onStateChange: (evt: unknown) => void;
      onError: (evt: unknown) => void;
    };
  },
) => YTPlayer;

interface YTGlobal {
  Player: YTPlayerConstructor;
  PlayerState: Record<string, number>;
}

let YTApi: YTGlobal | null = null;
let ytReadyPromise: Promise<YTGlobal> | null = null;

const YT_API_URL = "https://www.youtube.com/iframe_api";

function loadYTAPI(): Promise<YTGlobal> {
  if (YTApi) {
    log("API Loaded (cached)");
    return Promise.resolve(YTApi);
  }
  if (ytReadyPromise) {
    return ytReadyPromise;
  }

  if (typeof window === "undefined") {
    return Promise.reject(new Error("YouTube API can only be loaded on client"));
  }

  log("Loading YouTube API...");

  ytReadyPromise = new Promise<YTGlobal>((resolve, reject) => {
    const timeout = setTimeout(() => {
      logError("API Timeout: onYouTubeIframeAPIReady not called in 15s");
      ytReadyPromise = null;
      reject(new Error("YouTube IFrame API timeout"));
    }, 15000);

    window.onYouTubeIframeAPIReady = () => {
      log("onYouTubeIframeAPIReady CALLED");
      clearTimeout(timeout);
      YTApi = window.YT!;
      ytReadyPromise = null;
      log("API Loaded", !!YTApi?.Player);
      resolve(window.YT!);
    };

    if (!document.querySelector(`script[src="${YT_API_URL}"]`)) {
      const tag = document.createElement("script");
      tag.src = YT_API_URL;
      tag.async = true;
      tag.onload = () => log("Script loaded");
      tag.onerror = () => logError("Script load error");
      document.head.appendChild(tag);
      log("Script appended");
    } else {
      log("Script already in DOM");
    }
  });

  return ytReadyPromise;
}

export type YouTubePlayerInstance = YTPlayer;
export interface UseYouTubePlayerReturn {
  player: YouTubePlayerInstance | null;
  isPlayerReady: boolean;
  error: string | null;
  initialize: (elementId: string, source: ResolvedSource) => Promise<YouTubePlayerInstance>;
  loadSource: (source: ResolvedSource) => void;
  destroy: () => void;
}

const YT_PLAYER_STATES = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const;

const YT_ERRORS: Record<number, string> = {
  2: "Permintaan video tidak valid.",
  5: "HTML5 Error.",
  100: "Video tidak ditemukan atau Anda tidak memiliki izin.",
  101: "Video tidak tersedia untuk disematkan.",
  150: "Video tidak tersedia untuk disematkan.",
};

export function useYouTubePlayer(): UseYouTubePlayerReturn {
  const [player, setPlayer] = useState<YouTubePlayerInstance | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<YouTubePlayerInstance | null>(null);
  const initializingRef = useRef(false);
  // Video yang sedang dimuat di player (untuk deteksi pergantian audio).
  const loadedVideoIdRef = useRef<string | null>(null);

  const store = usePlayerStore();

  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  const initialize = useCallback(
    async (elementId: string, source: ResolvedSource): Promise<YouTubePlayerInstance> => {
      // Prevent double initialization
      if (initializingRef.current || playerRef.current) {
        log("Already initialized, returning existing player");
        return playerRef.current!;
      }

      initializingRef.current = true;

      log("Initialize - elementId:", elementId, "videoId:", source.providerId);

      if (source.provider !== "YOUTUBE") {
        initializingRef.current = false;
        const msg = `Provider ${source.provider} belum didukung`;
        setError(msg);
        return Promise.reject(new Error(msg));
      }

      setError(null);

      const container = document.getElementById(elementId);
      if (!container) {
        initializingRef.current = false;
        const msg = "Player container tidak ditemukan";
        setError(msg);
        return Promise.reject(new Error(msg));
      }

      if (!source.providerId) {
        initializingRef.current = false;
        const msg = "Video ID tidak ditemukan";
        setError(msg);
        return Promise.reject(new Error(msg));
      }

      // Create iframe directly with YouTube embed URL
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const embedUrl = `https://www.youtube.com/embed/${source.providerId}?enablejsapi=1&rel=0&modestbranding=1&controls=0&disablekb=1&fs=0&cc_load_policy=0&iv_load_policy=0&autoplay=0&playsinline=1&origin=${encodeURIComponent(origin)}`;

      log("Creating iframe with embed URL");

      // Clear container
      container.innerHTML = "";

      const iframe = document.createElement("iframe");
      iframe.id = `yt-iframe-${Date.now()}`;
      iframe.src = embedUrl;
      iframe.width = "100%";
      iframe.height = "100%";
      iframe.frameBorder = "0";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      iframe.style.border = "none";

      container.appendChild(iframe);

      log("Iframe created, loading YouTube API...");

      const api = await loadYTAPI();
      log("API ready, creating player instance...");

      return new Promise<YouTubePlayerInstance>((resolve, reject) => {
        const timeout = setTimeout(() => {
          initializingRef.current = false;
          logError("Timeout: onReady not called in 10s");
          reject(new Error("Timeout: YouTube player not ready"));
        }, 10000);

        try {
          const ytPlayer = new api.Player(iframe, {
            events: {
              onReady: () => {
                clearTimeout(timeout);
                log("onReady");
                setIsPlayerReady(true);
                initializingRef.current = false;

                try {
                  ytPlayer.setVolume(Math.round(store.config.volume * 100));
                  ytPlayer.setPlaybackRate(store.config.speed);
                  if (store.config.muted) ytPlayer.mute();
                } catch (err) {
                  logError("Init error:", err);
                }

                resolve(ytPlayer as YouTubePlayerInstance);
              },
              onStateChange: (evt: unknown) => {
                const state = (evt as { data: number }).data;
                const stateNames: Record<number, string> = {
                  "-1": "UNSTARTED",
                  "0": "ENDED",
                  "1": "PLAYING",
                  "2": "PAUSED",
                  "3": "BUFFERING",
                  "5": "CUED",
                };
                // Only log significant state changes to reduce spam
                if (state === YT_PLAYER_STATES.PLAYING || state === YT_PLAYER_STATES.PAUSED || state === YT_PLAYER_STATES.ENDED) {
                  log("onStateChange:", stateNames[state] ?? state);
                }

                if (state === YT_PLAYER_STATES.PLAYING) store.actions.setStatus("playing");
                else if (state === YT_PLAYER_STATES.PAUSED) store.actions.setStatus("paused");
                else if (state === YT_PLAYER_STATES.BUFFERING) store.actions.setStatus("buffering");
                else if (state === YT_PLAYER_STATES.ENDED) {
                  store.actions.setStatus("ended");
                  // Auto-lanjut ke sesi berikutnya bila masih ada.
                  store.actions.next();
                }
              },
              onError: (evt: unknown) => {
                const code = (evt as { data: number }).data;
                const msg = YT_ERRORS[code] ?? `YouTube error (code: ${code})`;
                logError("onError:", code, msg);
                setError(msg);
                store.actions.setError(msg);
                initializingRef.current = false;
                reject(new Error(msg));
              },
            },
          });

          log("Player instance created");
          setPlayer(ytPlayer as YouTubePlayerInstance);
          playerRef.current = ytPlayer as YouTubePlayerInstance;
          loadedVideoIdRef.current = source.providerId ?? null;
        } catch (err) {
          logError("Create error:", err);
          clearTimeout(timeout);
          initializingRef.current = false;
          reject(err);
        }
      });
    },
    [store.actions, store.config.muted, store.config.speed, store.config.volume],
  );

  const loadSource = useCallback((source: ResolvedSource) => {
    const currentPlayer = playerRef.current;
    if (currentPlayer && source.provider === "YOUTUBE" && source.providerId) {
      try {
        currentPlayer.cueVideoById(source.providerId);
        setError(null);
      } catch {
        setError("Gagal memuat sumber audio");
      }
    }
  }, []);

  const destroy = useCallback(() => {
    const currentPlayer = playerRef.current;
    if (currentPlayer) {
      log("Destroy");
      try {
        currentPlayer.destroy();
      } catch {
        // ignore
      }
      setPlayer(null);
      setIsPlayerReady(false);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentPlayer = playerRef.current;
      if (currentPlayer && isPlayerReady && store.status === "playing") {
        try {
          const currentPosition = currentPlayer.getCurrentTime();
          if (Math.abs(currentPosition - store.position) > 0.5) {
            store.actions.setPosition(currentPosition);
          }
          const dur = currentPlayer.getDuration();
          if (dur > 0 && dur !== store.duration) {
            store.actions.setDuration(dur);
          }
        } catch {
          // ignore polling errors
        }
      }
    }, 250);

    return () => clearInterval(interval);
  }, [isPlayerReady, store.status, store.position, store.duration, store.actions]);

  useEffect(() => {
    if (!player || !isPlayerReady) return;

    try {
      player.setVolume(Math.round(store.config.volume * 100));
      if (store.config.muted) player.mute();
      else player.unMute();
      player.setPlaybackRate(store.config.speed);

      switch (store.status) {
        case "playing":
          player.playVideo();
          break;
        case "paused":
          player.pauseVideo();
          break;
        case "ended":
          player.seekTo(0, true);
          player.pauseVideo();
          break;
      }
    } catch {
      // ignore sync errors
    }
  }, [player, isPlayerReady, store.status, store.config]);

  // Muat video baru saat audio berganti (next/previous/auto-next).
  // Dilewati bila video masih sama (mis. inisialisasi awal halaman).
  const currentAudio = store.currentAudio;
  useEffect(() => {
    if (!player || !isPlayerReady) return;
    if (!currentAudio) return;
    const source = resolveBestSource(currentAudio.mediaSources);
    if (!source || source.provider !== "YOUTUBE" || !source.providerId) return;
    if (loadedVideoIdRef.current === source.providerId) return;

    try {
      loadedVideoIdRef.current = source.providerId;
      player.cueVideoById(source.providerId);
      store.actions.setStatus("playing");
    } catch {
      store.actions.setError("Gagal memuat audio berikutnya");
    }
  }, [player, isPlayerReady, currentAudio, store.actions]);

  // Seek hanya saat posisi melompat (user drag / restore history), bukan dari poll.
  useEffect(() => {
    if (!player || !isPlayerReady) return;

    let currentTime = 0;
    try {
      currentTime = player.getCurrentTime();
    } catch {
      return;
    }
    if (store.position > 0 && Math.abs(store.position - currentTime) > 2) {
      try {
        player.seekTo(store.position, true);
      } catch {
        // ignore seek errors
      }
    }
  }, [player, isPlayerReady, store.position]);

  useEffect(() => {
    return () => destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    player,
    isPlayerReady,
    error,
    initialize,
    loadSource,
    destroy,
  };
}
