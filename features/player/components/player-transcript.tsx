"use client";

import { useEffect, useRef } from "react";
import { usePlayer, usePlayerActions } from "@/features/player/hooks/use-player";
import { cn } from "@/utils/cn";
import type { TranscriptSegment } from "@/utils/youtube-captions";

interface PlayerTranscriptProps {
  segments: TranscriptSegment[];
  language?: string;
}

/** Transkrip bergaya karaoke: baris aktif ter-sync dengan posisi putar + auto-scroll. */
export function PlayerTranscript({ segments, language }: PlayerTranscriptProps) {
  const { position } = usePlayer();
  const actions = usePlayerActions();
  const containerRef = useRef<HTMLDivElement>(null);

  let activeIndex = -1;
  for (let i = 0; i < segments.length; i++) {
    if (position >= segments[i].start) activeIndex = i;
    else break;
  }

  useEffect(() => {
    const container = containerRef.current;
    if (!container || activeIndex < 0) return;
    const el = container.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [activeIndex]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted">
          Klik baris untuk melompat ke bagian tersebut.
        </p>
        {language && (
          <span className="rounded bg-border/50 px-2 py-0.5 text-xs text-muted">
            {language}
          </span>
        )}
      </div>

      <div
        ref={containerRef}
        className="flex max-h-[420px] flex-col gap-1 overflow-y-auto pr-2"
      >
        {segments.map((seg, i) => {
          const isActive = i === activeIndex;
          const progress = isActive
            ? Math.min(100, Math.max(0, ((position - seg.start) / (seg.end - seg.start || 1)) * 100))
            : 0;

          return (
            <button
              key={i}
              type="button"
              data-index={i}
              onClick={() => actions.seek(seg.start)}
              className={cn(
                "group relative flex items-start gap-3 rounded-lg px-3 py-1.5 text-left transition-colors",
                isActive ? "bg-brand/10" : "hover:bg-border/40",
              )}
            >
              <span
                className={cn(
                  "mt-2 h-full w-0.5 shrink-0 rounded-full transition-colors",
                  isActive ? "bg-brand" : "bg-transparent",
                )}
                aria-hidden
              />
              <span
                className={cn(
                  "relative min-w-0 flex-1 text-sm leading-relaxed transition-colors",
                  isActive ? "text-foreground" : "text-muted",
                )}
              >
                <span className={isActive ? "font-semibold" : ""}>{seg.text}</span>
                {isActive && progress > 0 && (
                  <span
                    aria-hidden
                    className="absolute inset-0 overflow-hidden whitespace-pre text-sm font-semibold leading-relaxed text-brand"
                    style={{ width: `${progress}%` }}
                  >
                    {seg.text}
                  </span>
                )}
              </span>
              <span className="mt-1 shrink-0 text-[10px] tabular-nums text-muted/70">
                {formatTime(seg.start)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
