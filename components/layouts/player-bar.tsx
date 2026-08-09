"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Play, Pause, SkipBack, SkipForward, X, ChevronUp } from "lucide-react";
import { formatDuration } from "@/utils/duration";
import { usePlayer } from "@/features/player/hooks/use-player";
import { usePlayerActions } from "@/features/player/hooks/use-player";
import { resolveBestSource } from "@/features/player/services/player-service";
import { useYouTubePlayer } from "@/features/player/hooks/use-youtube-player";
import { Cover } from "@/components/shared/cover";
import type { PlayerAudio } from "@/features/player/types/player";

interface MiniPlayerProps {
  audio: PlayerAudio | null;
  visible: boolean;
  onExpand: () => void;
  onClose: () => void;
}

export function MiniPlayerBar({ audio, visible, onExpand, onClose }: MiniPlayerProps) {
  const { status, position, duration } = usePlayer();
  const actions = usePlayerActions();
  const { initialize, error: ytError } = useYouTubePlayer();
  const initializedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isPlaying = status === "playing";
  const percent = duration > 0 ? (position / duration) * 100 : 0;

  useEffect(() => {
    if (!audio || initializedRef.current) return;

    const source = resolveBestSource(audio.mediaSources);
    if (!source) return;

    void initialize("yt-player-mini", source);
    initializedRef.current = true;
  }, [audio, initialize]);

  if (!visible || !audio) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-x-0 bottom-0 z-30 flex flex-col gap-1 border-t border-border bg-surface p-3 shadow-lg animate-slide-up motion-reduce:animate-none"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Cover src={audio.cover} alt={audio.judul} variant="square" className="h-10 w-10" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{audio.judul}</p>
            <p className="truncate text-xs text-muted">
              {audio.series.judul} · {formatDuration(Math.floor(position))} / {formatDuration(Math.floor(audio.durasi))}
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label={isPlaying ? "Jeda" : "Putar"}
          onClick={() => (isPlaying ? actions.pause() : actions.play())}
          className="rounded-full p-2 text-foreground transition-all duration-150 ease-out hover:bg-brand/10 active:scale-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring motion-reduce:transition-none"
        >
          {isPlaying ? <Pause className="h-5 w-5" aria-hidden /> : <Play className="h-5 w-5" aria-hidden />}
        </button>

        <div className="hidden items-center gap-1 md:flex">
          <button
            type="button"
            aria-label="Sesi sebelumnya"
            onClick={() => actions.previous()}
            className="rounded-full p-1.5 text-muted transition-all duration-150 ease-out hover:text-foreground active:scale-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring motion-reduce:transition-none"
          >
            <SkipBack className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Sesi berikutnya"
            onClick={() => actions.next()}
            className="rounded-full p-1.5 text-muted transition-all duration-150 ease-out hover:text-foreground active:scale-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring motion-reduce:transition-none"
          >
            <SkipForward className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <button
          type="button"
          aria-label="Buka player penuh"
          onClick={onExpand}
          className="rounded-full p-1.5 text-muted transition-all duration-150 ease-out hover:text-foreground active:scale-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring motion-reduce:transition-none"
        >
          <ChevronUp className="h-4 w-4" aria-hidden />
        </button>

        <button
          type="button"
          aria-label="Tutup"
          onClick={onClose}
          className="rounded-full p-1.5 text-muted transition-all duration-150 ease-out hover:text-foreground active:scale-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring motion-reduce:transition-none"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div
        className="h-1 w-full cursor-pointer rounded-full bg-border"
        role="slider"
        aria-label="Progress audio"
        aria-valuenow={position}
        aria-valuemin={0}
        aria-valuemax={duration || 1}
        aria-valuetext={`${formatDuration(Math.floor(position))} / ${formatDuration(Math.floor(duration))}`}
      >
        <div className="h-full rounded-full bg-brand transition-[width] duration-200 ease-linear motion-reduce:transition-none" style={{ width: `${percent}%` }} />
      </div>

      {ytError && (
        <p className="text-xs text-destructive" role="alert">
          {ytError}
        </p>
      )}

      {/* Hidden YouTube container for mini player - has dimensions for API to work */}
      <div
        id="yt-player-mini"
        className="pointer-events-none absolute h-1 w-1 opacity-0"
        aria-hidden
        style={{ left: '-9999px', top: '-9999px' }}
      />
    </div>
  );
}

export function MiniPlayerToggle({ audio }: { audio: PlayerAudio }) {
  const actions = usePlayerActions();

  return (
    <Link
      href={`/audio/${audio.slug}`}
      className="flex items-center gap-2 text-sm text-muted hover:text-foreground"
      onClick={() => {
        actions.loadAudio(audio);
      }}
    >
      <Cover src={audio.cover} alt={audio.judul} variant="square" className="h-8 w-8" />
      <span className="truncate">{audio.judul}</span>
    </Link>
  );
}
