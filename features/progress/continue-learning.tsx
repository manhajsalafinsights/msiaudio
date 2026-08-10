"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import { formatDurationHuman } from "@/utils/duration";

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

  return (
    <section className="flex flex-col gap-4" aria-label="Lanjutkan Belajar">
      <div>
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Lanjutkan Belajar</h2>
        <p className="mt-1 text-sm text-muted">Lanjutkan kajian dari posisi terakhirmu.</p>
      </div>
      <div className="flex flex-col gap-3">
        {items.map((item) => {
          const audio = item.lastAudio;
          if (!audio) return null;
          const percent = Math.min(100, Math.max(0, Math.round(item.progressPercent)));

          return (
            <div
              key={item.id}
              className="group flex items-center gap-3 rounded-2xl border border-brand/15 bg-surface p-4 transition-all hover:border-brand/30 hover:shadow-sm sm:gap-4"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-brand/10">
                {item.series.cover ? (
                  <Image
                    src={item.series.cover}
                    alt={item.series.judul}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-brand">
                    <Play className="h-6 w-6" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/series/${item.series.slug}`}
                  className="block truncate text-sm font-semibold hover:text-brand sm:text-base"
                >
                  {item.series.judul}
                </Link>
                <p className="mt-0.5 truncate text-[13px] text-muted">
                  {audio.judul} · {formatDurationHuman(audio.durasi)}
                </p>

                <div className="mt-2.5 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-border/60">
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
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-md shadow-brand/20 transition-all hover:bg-brand-hover hover:shadow-lg active:scale-95"
              >
                <Play className="h-6 w-6 fill-current" />
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
