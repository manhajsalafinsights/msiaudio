"use client";

import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import { cn } from "@/utils/cn";

interface PlayerControlsProps {
  isPlaying: boolean;
  canRewind: boolean;
  onPlay: () => void;
  onPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onRewind: () => void;
  onForward: () => void;
}

export function PlayerControls({
  isPlaying,
  canRewind,
  onPlay,
  onPause,
  onPrevious,
  onNext,
  onRewind,
  onForward,
}: PlayerControlsProps) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      <ControlButton
        aria-label="Sesi sebelumnya"
        onClick={onPrevious}
        disabled={!canRewind}
      >
        <SkipBack className="h-5 w-5" />
      </ControlButton>

      <ControlButton aria-label="Mundur 10 detik" onClick={onRewind} secondary>
        <RotateCcw className="h-5 w-5" />
      </ControlButton>

      <button
        type="button"
        aria-label={isPlaying ? "Jeda" : "Putar"}
        onClick={isPlaying ? onPause : onPlay}
        className="btn-player h-16 w-16 shrink-0 bg-brand text-white shadow-lg shadow-brand/30 hover:shadow-xl hover:shadow-brand/40"
      >
        {isPlaying ? (
          <Pause className="h-7 w-7 fill-current" />
        ) : (
          <Play className="ml-0.5 h-7 w-7 fill-current" />
        )}
      </button>

      <ControlButton aria-label="Maju 30 detik" onClick={onForward} secondary>
        <RotateCw className="h-5 w-5" />
      </ControlButton>

      <ControlButton aria-label="Sesi berikutnya" onClick={onNext}>
        <SkipForward className="h-5 w-5" />
      </ControlButton>
    </div>
  );
}

interface ControlButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  secondary?: boolean;
}

function ControlButton({ secondary, className, ...props }: ControlButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "btn-player h-11 w-11 shrink-0 text-foreground/70 hover:text-foreground",
        secondary && "bg-surface",
        className,
      )}
      {...props}
    />
  );
}
