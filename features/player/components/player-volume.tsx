"use client";

import { Volume2, VolumeX, Gauge } from "lucide-react";
import { cn } from "@/utils/cn";
import { SPEED_OPTIONS_ARRAY } from "@/features/player/types/player";

interface SpeedControlProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
}

export function SpeedControl({ speed, onSpeedChange }: SpeedControlProps) {
  return (
    <div className="flex items-center gap-2">
      <Gauge className="h-4 w-4 text-muted" aria-hidden />
      <select
        aria-label="Kecepatan pemutaran"
        value={speed}
        onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
        className={cn(
          "rounded-lg border border-border bg-surface px-2 py-1.5 text-xs font-medium text-foreground",
          "transition-colors duration-150 ease-out",
          "hover:border-brand/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand",
        )}
      >
        {SPEED_OPTIONS_ARRAY.map((s) => (
          <option key={s} value={s}>
            {s}×
          </option>
        ))}
      </select>
    </div>
  );
}

interface VolumeControlProps {
  volume: number;
  muted: boolean;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
}

export function VolumeControl({ volume, muted, onVolumeChange, onToggleMute }: VolumeControlProps) {
  const effectiveVolume = muted ? 0 : volume;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label={muted ? "Bunyi" : "Bisukan"}
        onClick={onToggleMute}
        className="rounded-lg p-1.5 text-muted transition-colors duration-150 hover:text-foreground hover:bg-border/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand"
      >
        {muted || volume === 0 ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </button>
      <div className="relative h-1.5 w-24 rounded-full bg-border">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-brand"
          style={{ width: `${effectiveVolume * 100}%` }}
        />
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(effectiveVolume * 100)}
          onChange={(e) => onVolumeChange(parseInt(e.target.value, 10) / 100)}
          aria-label="Volume"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>
    </div>
  );
}
