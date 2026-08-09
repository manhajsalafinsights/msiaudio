"use client";

import { useEffect, useRef } from "react";
import type { PlayerStatus } from "@/features/player/types/player";

interface UseProgressReporterOptions {
  audioId: string;
  seriesId: string;
  duration: number;
  position: number;
  status: PlayerStatus;
}

const REPORT_INTERVAL_SECONDS = 10;
const COMPLETED_THRESHOLD = 0.95;

export function useProgressReporter({
  audioId,
  seriesId,
  duration,
  position,
  status,
}: UseProgressReporterOptions) {
  const lastSentRef = useRef(-1);

  useEffect(() => {
    lastSentRef.current = -1;
  }, [audioId]);

  useEffect(() => {
    if (status === "idle" || status === "loading") return;
    if (position <= 0 && lastSentRef.current === -1) return;

    const nearEnd = duration > 0 && position >= duration * COMPLETED_THRESHOLD;
    const shouldReport =
      position - lastSentRef.current >= REPORT_INTERVAL_SECONDS ||
      status === "paused" ||
      status === "ended" ||
      nearEnd;

    if (!shouldReport) return;

    lastSentRef.current = position;

    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audioId, seriesId, positionSeconds: position, duration }),
    }).catch(() => {});
  }, [audioId, seriesId, duration, position, status]);
}
