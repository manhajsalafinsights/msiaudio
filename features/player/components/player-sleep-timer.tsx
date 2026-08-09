"use client";

import * as React from "react";
import { Moon } from "lucide-react";
import { SLEEP_TIMER_OPTIONS_ARRAY } from "@/features/player/types/player";
import { usePlayerActions } from "@/features/player/hooks/use-player";
import { usePlayerStore } from "@/features/player/store/player-store";

interface SleepTimerProps {
  compact?: boolean;
}

export function SleepTimer({ compact = false }: SleepTimerProps) {
  const sleepTimer = usePlayerStore((state) => state.config.sleepTimer);
  const setSleepTimer = usePlayerActions().setSleepTimer;
  const [isOpen, setIsOpen] = React.useState(false);

  const formatTime = (minutes: number) => {
    if (minutes >= 60) {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return m > 0 ? `${h}j ${m}m` : `${h}j`;
    }
    return `${minutes}m`;
  };

  const handleSelect = (minutes: number | null) => {
    setSleepTimer(minutes);
    setIsOpen(false);
  };

  if (compact) {
    return (
      <select
        aria-label="Timer tidur"
        value={sleepTimer ?? ""}
        onChange={(e) => {
          const val = e.target.value;
          handleSelect(val ? parseInt(val, 10) : null);
        }}
        className="rounded-md border border-border bg-surface px-2 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <option value="">{sleepTimer ? formatTime(sleepTimer) : "Timer"}</option>
        {SLEEP_TIMER_OPTIONS_ARRAY.map((m) => (
          <option key={m} value={m}>
            {formatTime(m)}
          </option>
        ))}
        <option value="end">Sampai akhir sesi ini</option>
        <option value="off">Matikan</option>
      </select>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        aria-label={sleepTimer ? `Timer tidur: ${formatTime(sleepTimer)}` : "Atur timer tidur"}
        onClick={() => setIsOpen(!isOpen)}
        className={
          sleepTimer
            ? "inline-flex items-center gap-1.5 rounded-md border border-brand bg-brand/10 px-3 py-1.5 text-sm font-medium text-brand"
            : "inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-muted hover:text-foreground"
        }
      >
        <Moon className="h-4 w-4" aria-hidden />
        {sleepTimer ? formatTime(sleepTimer) : "Timer Tidur"}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute bottom-full left-1/2 mb-2 w-48 -translate-x-1/2 rounded-md border border-border bg-surface shadow-lg">
            <ul className="py-1 text-sm">
              {SLEEP_TIMER_OPTIONS_ARRAY.map((m) => (
                <li key={m}>
                  <button
                    type="button"
                    className="w-full px-4 py-2 text-left hover:bg-border/40"
                    onClick={() => handleSelect(m)}
                  >
                    {formatTime(m)}
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  className="w-full px-4 py-2 text-left hover:bg-border/40"
                  onClick={() => handleSelect("end" as unknown as number)}
                >
                  Sampai akhir sesi ini
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="w-full px-4 py-2 text-left hover:bg-border/40"
                  onClick={() => handleSelect(null)}
                >
                  Matikan
                </button>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

SleepTimer.displayName = "SleepTimer";
SleepTimer.Compact = SleepTimer;
