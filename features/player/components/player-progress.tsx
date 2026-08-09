"use client";

import { useRef, useState } from "react";
import { formatDuration } from "@/utils/duration";
import { cn } from "@/utils/cn";

interface ProgressBarProps {
  position: number;
  duration: number;
  onSeek: (position: number) => void;
  interactive?: boolean;
}

export function ProgressBar({ position, duration, onSeek, interactive = true }: ProgressBarProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const percent = duration > 0 ? (position / duration) * 100 : 0;
  const enabled = interactive && duration > 0;

  const seekFromClientX = (clientX: number) => {
    const track = trackRef.current;
    if (!track || !enabled) return;
    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    onSeek(ratio * duration);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled) return;
    e.preventDefault();
    trackRef.current?.setPointerCapture?.(e.pointerId);
    setDragging(true);
    seekFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    seekFromClientX(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    trackRef.current?.releasePointerCapture?.(e.pointerId);
    setDragging(false);
    seekFromClientX(e.clientX);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!enabled) return;
    const step = 10;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      onSeek(Math.min(duration, position + step));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      onSeek(Math.max(0, position - step));
    } else if (e.key === "Home") {
      e.preventDefault();
      onSeek(0);
    } else if (e.key === "End") {
      e.preventDefault();
      onSeek(duration);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={trackRef}
        role="slider"
        tabIndex={enabled ? 0 : -1}
        aria-label="Progress audio"
        aria-valuenow={Math.floor(position)}
        aria-valuemin={0}
        aria-valuemax={Math.floor(duration) || 1}
        aria-valuetext={`${formatDuration(Math.floor(position))} dari ${formatDuration(Math.floor(duration))}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
        className={cn("player-progress-track", !enabled && "cursor-default")}
      >
        <div className="player-progress-fill" style={{ width: `${percent}%` }} />
        {enabled && <div className="player-progress-thumb" style={{ left: `${percent}%` }} />}
      </div>
      <div className="flex justify-between text-xs tabular-nums text-muted">
        <span>{formatDuration(Math.floor(position))}</span>
        <span>{formatDuration(Math.floor(duration))}</span>
      </div>
    </div>
  );
}
