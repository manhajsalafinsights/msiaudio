"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";

interface SeriesProgressData {
  progressPercent: number;
  completedCount: number;
  lastAudioId: string | null;
  lastAudio: { slug: string; nomorSesi: number } | null;
}

/**
 * Kartu progress series (hanya tampil saat user login & sudah mulai belajar).
 * Data diambil client-side via /api/progress agar halaman tetap static/cacheable.
 */
export function SeriesProgressCard({ seriesId, totalSesi }: { seriesId: string; totalSesi: number }) {
  const [progress, setProgress] = useState<SeriesProgressData | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/progress?seriesId=${seriesId}`)
      .then((res) => (res.ok ? res.json() : { progress: null }))
      .then((data: { progress?: SeriesProgressData | null }) => {
        if (!cancelled) setProgress(data.progress ?? null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [seriesId]);

  const percent = progress ? Math.round(progress.progressPercent) : 0;
  if (!progress || percent <= 0) return null;

  return (
    <div className="flex max-w-md flex-col gap-2 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">Progress Anda</span>
        <span className="text-brand">
          {percent}% selesai · {progress.completedCount} / {totalSesi} sesi
        </span>
      </div>
      <ProgressBar value={percent} />
    </div>
  );
}

/**
 * Tombol utama series — "Mulai dari Awal" atau "Lanjutkan Sesi N" sesuai
 * progress user (client-side via /api/progress).
 */
export function SeriesPlayButton({
  seriesId,
  firstAudioSlug,
}: {
  seriesId: string;
  firstAudioSlug: string;
}) {
  const [progress, setProgress] = useState<SeriesProgressData | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/progress?seriesId=${seriesId}`)
      .then((res) => (res.ok ? res.json() : { progress: null }))
      .then((data: { progress?: SeriesProgressData | null }) => {
        if (!cancelled) setProgress(data.progress ?? null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [seriesId]);

  const percent = progress ? Math.round(progress.progressPercent) : 0;
  const lastAudio = progress?.lastAudioId ? progress.lastAudio : null;
  const resume =
    progress && percent > 0 && percent < 100 && lastAudio
      ? { href: `/audio/${lastAudio.slug}`, label: `Lanjutkan Sesi ${lastAudio.nomorSesi}` }
      : null;

  return (
    <Button asChild>
      <Link href={resume?.href ?? `/audio/${firstAudioSlug}`}>
        {resume?.label ?? "Mulai dari Awal"}
      </Link>
    </Button>
  );
}
