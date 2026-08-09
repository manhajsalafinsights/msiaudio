"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Trash2 } from "lucide-react";
import { formatDuration, formatDurationHuman } from "@/utils/duration";
import { formatDistanceToNow } from "@/utils/date";

interface HistoryItem {
  id: string;
  positionSeconds: number;
  progressPercent: number;
  completed: boolean;
  playCount: number;
  lastPlayedAt: Date;
  audio: {
    judul: string;
    slug: string;
    durasi: number;
    cover: string | null;
    nomorSesi: number;
    series: { judul: string; slug: string };
  };
}

export function HistoryList({ items: initialItems }: { items: HistoryItem[] }) {
  const [items, setItems] = useState(initialItems);

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/history/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted">
        Semua riwayat telah dihapus.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-all hover:border-brand/30 hover:shadow-sm"
        >
          <Link
            href={`/audio/${item.audio.slug}`}
            className="flex min-w-0 flex-1 items-center gap-4"
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-brand/10">
              {item.audio.cover ? (
                <Image
                  src={item.audio.cover}
                  alt={item.audio.judul}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-brand">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium group-hover:text-brand">
                  {item.audio.judul}
                </p>
                {item.completed && (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-label="Selesai" />
                )}
              </div>
              <p className="mt-0.5 truncate text-xs text-muted">
                {item.audio.series.judul} · Sesi {item.audio.nomorSesi}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                Terakhir didengar {formatDistanceToNow(new Date(item.lastPlayedAt))}
                {item.playCount > 1 ? ` · ${item.playCount}x diputar` : ""}
              </p>

              {!item.completed && (
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border/60">
                    <div
                      className="h-full rounded-full bg-brand transition-all"
                      style={{ width: `${Math.min(100, item.progressPercent)}%` }}
                    />
                  </div>
                  <span className="shrink-0 text-xs font-medium text-brand">
                    {formatDuration(item.positionSeconds)} /{" "}
                    {formatDurationHuman(item.audio.durasi)}
                  </span>
                </div>
              )}
            </div>
          </Link>

          <button
            type="button"
            aria-label="Hapus riwayat"
            onClick={() => handleDelete(item.id)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted opacity-0 transition-opacity hover:bg-border/40 hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
