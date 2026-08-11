"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import { cn } from "@/utils/cn";
import { formatDurationHuman } from "@/utils/duration";
import { AudioDisc } from "@/components/shared/audio-disc";

interface ContinueLearningItem {
  id: string;
  progressPercent: number;
  series: { cover: string | null; judul: string; slug: string };
  lastAudio: { judul: string; slug: string; durasi: number } | null;
}

export function ContinueLearning() {
  const [items, setItems] = useState<ContinueLearningItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/continue-learning")
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data: { items?: ContinueLearningItem[] }) => {
        if (!cancelled) setItems(data.items ?? []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (items.length === 0) {
    return null;
  }

  const primary = items[0]?.lastAudio ? items[0] : null;
  const rest = items.slice(primary ? 1 : 0).filter((i) => i.lastAudio);

  return (
    <section className="flex flex-col gap-4" aria-label="Lanjutkan Belajar">
      <div>
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Lanjutkan Belajar</h2>
        <p className="mt-1 text-sm text-muted">Lanjutkan kajian dari posisi terakhirmu.</p>
      </div>

      {primary && <ContinueHero item={primary} />}

      {rest.length > 0 && (
        <div className="flex flex-col gap-3">
          {rest.map((item) => (
            <ContinueRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}

/* ================================================================
   Hero "Up Next" — item terakhir didengarkan
   ================================================================ */

function ContinueHero({ item }: { item: ContinueLearningItem }) {
  const audio = item.lastAudio!;
  const percent = clampPercent(item.progressPercent);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand/15 bg-surface p-5 sm:p-8">
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand/10 blur-3xl"
        aria-hidden
      />

      <div className="relative flex flex-row items-center gap-4 sm:gap-10">
        <div className="relative h-28 w-28 shrink-0 sm:h-52 sm:w-52">
          <AudioDisc
            src={item.series.cover}
            alt={item.series.judul}
            className="h-full w-full rounded-none"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-start gap-2 text-left sm:gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-brand sm:text-xs">
            Terakhir Didengarkan
          </p>

          <Link
            href={`/series/${item.series.slug}`}
            className="line-clamp-2 text-base font-bold tracking-tight hover:text-brand sm:text-2xl"
          >
            {item.series.judul}
          </Link>

          <p className="line-clamp-1 text-xs text-muted sm:text-sm">
            {audio.judul} · {formatDurationHuman(audio.durasi)}
          </p>

          <div className="mt-0.5 flex flex-wrap items-center gap-3 sm:mt-1 sm:gap-4">
            <div className="relative flex h-16 w-16 items-center justify-center sm:h-20 sm:w-20">
              <ProgressRing percent={percent} className="absolute inset-0 h-full w-full" />
              <Link
                href={`/audio/${audio.slug}`}
                aria-label={`Lanjutkan ${audio.judul}`}
                className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white shadow-md shadow-brand/20 transition-all hover:bg-brand-hover hover:shadow-lg active:scale-95 sm:h-12 sm:w-12"
              >
                <Play className="h-4 w-4 fill-current sm:h-5 sm:w-5" />
              </Link>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-medium text-muted sm:text-xs">Progress</span>
              <span className="text-xs font-semibold text-brand sm:text-sm">{percent}% selesai</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   Baris ringkas — item lanjutan lainnya
   ================================================================ */

function ContinueRow({ item }: { item: ContinueLearningItem }) {
  const audio = item.lastAudio!;
  const percent = clampPercent(item.progressPercent);

  return (
    <div className="group flex items-center gap-3 rounded-xl border border-border bg-surface p-3 transition-all hover:border-brand/20 hover:shadow-sm sm:gap-4">
      <Link
        href={`/series/${item.series.slug}`}
        className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl"
      >
        <AudioDisc
          src={item.series.cover}
          alt={item.series.judul}
          hideBadge
          className="h-full w-full rounded-none"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          href={`/series/${item.series.slug}`}
          className="block truncate text-sm font-semibold hover:text-brand"
        >
          {item.series.judul}
        </Link>
        <p className="mt-0.5 truncate text-[13px] text-muted">
          {audio.judul} · {formatDurationHuman(audio.durasi)}
        </p>
        <div className="mt-2 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border/60">
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="shrink-0 text-xs font-semibold text-brand">{percent}%</span>
        </div>
      </div>

      <Link
        href={`/audio/${audio.slug}`}
        aria-label={`Lanjutkan ${audio.judul}`}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-md shadow-brand/20 transition-all hover:bg-brand-hover hover:shadow-lg active:scale-95"
      >
        <Play className="h-5 w-5 fill-current" />
      </Link>
    </div>
  );
}

/* ================================================================
   Progress ring
   ================================================================ */

function ProgressRing({ percent, className }: { percent: number; className?: string }) {
  const size = 80;
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={cn("-rotate-90", className)} aria-hidden>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.15"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="text-brand transition-all duration-500"
      />
    </svg>
  );
}

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}
