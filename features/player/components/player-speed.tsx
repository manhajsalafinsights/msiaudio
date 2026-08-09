"use client";

import { SPEED_OPTIONS_ARRAY } from "@/features/player/types/player";
import { usePlayerActions } from "@/features/player/hooks/use-player";
import { usePlayerStore } from "@/features/player/store/player-store";

export function PlaybackSpeed() {
  const speed = usePlayerStore((state) => state.config.speed);
  const setSpeed = usePlayerActions().setSpeed;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted">Kecepatan</span>
      <div
        role="radiogroup"
        aria-label="Kecepatan pemutaran"
        className="flex flex-wrap items-center gap-1.5"
      >
        {SPEED_OPTIONS_ARRAY.map((s) => {
          const isActive = speed === s;
          return (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={`${s}x`}
              onClick={() => setSpeed(s)}
              className={
                isActive
                  ? "rounded-md border border-brand bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand"
                  : "rounded-md border border-border bg-surface px-2.5 py-1 text-xs text-muted hover:text-foreground"
              }
            >
              {s}×
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SpeedSelectorCompact() {
  const speed = usePlayerStore((state) => state.config.speed);
  const setSpeed = usePlayerActions().setSpeed;

  return (
    <select
      aria-label="Kecepatan pemutaran"
      value={speed}
      onChange={(e) => setSpeed(parseFloat(e.target.value))}
      className="rounded-md border border-border bg-surface px-2 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      {SPEED_OPTIONS_ARRAY.map((s) => (
        <option key={s} value={s}>
          {s}×
        </option>
      ))}
    </select>
  );
}
