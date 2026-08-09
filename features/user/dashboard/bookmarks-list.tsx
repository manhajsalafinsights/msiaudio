"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bookmark, Trash2 } from "lucide-react";
import { formatDurationHuman } from "@/utils/duration";

interface BookmarkItem {
  id: string;
  audio: {
    id: string;
    judul: string;
    slug: string;
    durasi: number;
    cover: string | null;
    nomorSesi: number;
    series: { judul: string; slug: string };
  };
}

export function DashboardBookmarksList({ items: initialItems }: { items: BookmarkItem[] }) {
  const [items, setItems] = useState(initialItems);

  const handleRemove = async (item: BookmarkItem) => {
    const res = await fetch("/api/bookmark/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audioId: item.audio.id }),
    });
    if (res.ok) {
      setItems((prev) => prev.filter((b) => b.id !== item.id));
    }
  };

  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted">
        Semua bookmark telah dihapus.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-3 transition-all hover:border-brand/30 hover:shadow-sm"
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
                  <Bookmark className="h-5 w-5" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium group-hover:text-brand">
                {item.audio.judul}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted">
                {item.audio.series.judul} · Sesi {item.audio.nomorSesi}
              </p>
              <p className="mt-0.5 text-xs text-muted">{formatDurationHuman(item.audio.durasi)}</p>
            </div>
          </Link>

          <button
            type="button"
            aria-label="Hapus bookmark"
            onClick={() => handleRemove(item)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted opacity-0 transition-opacity hover:bg-border/40 hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
