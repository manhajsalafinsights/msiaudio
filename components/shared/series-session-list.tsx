"use client";

import { useEffect, useState } from "react";
import { SessionRow } from "@/components/shared/session-row";
import type { AudioCard } from "@/repositories/audio-repository";

interface SessionStatus {
  completed: boolean;
  progressPercent: number;
}

/**
 * Daftar sesi dengan status mendengarkan user (centang & progress).
 * Data status diambil client-side via /api/listening agar halaman series
 * tetap static/cacheable (tanpa runtime API headers di server).
 */
export function SeriesSessionList({ audioList }: { audioList: AudioCard[] }) {
  const [statusMap, setStatusMap] = useState<Record<string, SessionStatus>>({});

  useEffect(() => {
    if (audioList.length === 0) return;
    let cancelled = false;
    const ids = audioList.map((a) => a.id).join(",");
    fetch(`/api/listening?audioIds=${ids}`)
      .then((res) => (res.ok ? res.json() : { status: {} }))
      .then((data: { status?: Record<string, SessionStatus> }) => {
        if (!cancelled) setStatusMap(data.status ?? {});
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [audioList]);

  return (
    <ul className="flex flex-col gap-3">
      {audioList.map((audio) => {
        const status = statusMap[audio.id];
        return (
          <SessionRow
            key={audio.id}
            audio={audio}
            nomor={audio.nomorSesi}
            completed={status?.completed}
            progressPercent={status?.progressPercent}
          />
        );
      })}
    </ul>
  );
}
