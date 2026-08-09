"use client";

import { createContext, useContext, useCallback, useEffect } from "react";
import { useYouTubePlayer } from "@/features/player/hooks/use-youtube-player";
import {
  buildPlayableUrl,
  isDirectUrlSource,
  isYouTubeSource,
} from "@/features/player/services/player-service";
import type { ResolvedSource } from "@/features/player/types/player";

interface PlayerProviderContext {
  isPlayerReady: boolean;
  playerError: string | null;
  initialize: (elementId: string, source: ResolvedSource) => Promise<unknown>;
}

const PlayerProviderContext = createContext<PlayerProviderContext | null>(null);

export function usePlayerProvider() {
  const ctx = useContext(PlayerProviderContext);
  if (!ctx) throw new Error("usePlayerProvider harus dipakai di dalam PlayerProvider");
  return ctx;
}

export function usePlayerContext() {
  const ctx = useContext(PlayerProviderContext);
  if (!ctx) throw new Error("usePlayerContext harus dipakai di dalam PlayerProvider");
  return ctx;
}

interface PlayerProviderProps {
  children: React.ReactNode;
  autoInitialize?: boolean;
  elementId?: string;
  /** URL sumber audio yang sudah di-resolve (dari resolveBestSource) */
  source?: ResolvedSource;
}

/**
 * Inisialisasi player berdasarkan provider.
 * - YouTube: gunakan IFrame API
 * - Direct URL (R2, BunnyCDN, S3): gunakan <audio> element atau IFrame API
 */
async function initializePlayer(
  initialize: (elementId: string, source: ResolvedSource) => Promise<unknown>,
  elId: string,
  src: ResolvedSource,
): Promise<unknown> {
  console.log("[initializePlayer] source:", src);
  if (isYouTubeSource(src)) {
    const videoId = buildPlayableUrl(src);
    console.log("[initializePlayer] videoId:", videoId);
    return initialize(elId, { provider: "YOUTUBE", url: src.url, providerId: videoId });
  }

  if (isDirectUrlSource(src)) {
    console.log("[initializePlayer] direct URL");
    return initialize(elId, { provider: src.provider, url: src.url });
  }

  return null;
}

/**
 * PlayerProvider — inisialisasi player berdasarkan URL sumber audio.
 *
 * Arsitektur URL-based:
 * - Database hanya menyimpan URL (YouTube, R2, BunnyCDN, dll)
 * - Tidak ada upload file audio
 * - Provider dipilih otomatis berdasarkan prioritas
 * - Admin cukup menempelkan URL di database
 *
 * Contoh penggunaan:
 * ```tsx
 * <PlayerProvider source={resolvedSource}>
 *   <PlayerFull audio={audio} />
 * </PlayerProvider>
 * ```
 */
export function PlayerProvider({
  children,
  autoInitialize = false,
  elementId,
  source,
}: PlayerProviderProps) {
  const { isPlayerReady, error, initialize } = useYouTubePlayer();

  const handleInitialize = useCallback(
    (elId: string, src: ResolvedSource) => initializePlayer(initialize, elId, src),
    [initialize],
  );

  useEffect(() => {
    if (autoInitialize && elementId && source) {
      void handleInitialize(elementId, source);
    }
  }, [autoInitialize, elementId, source, handleInitialize]);

  return (
    <PlayerProviderContext.Provider
      value={{
        isPlayerReady,
        playerError: error,
        initialize: handleInitialize,
      }}
    >
      {children}
    </PlayerProviderContext.Provider>
  );
}
