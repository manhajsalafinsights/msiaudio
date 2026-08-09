"use client";

import Link from "next/link";
import Image from "next/image";
import { AudioLines } from "lucide-react";
import { formatDuration } from "@/utils/duration";

interface BookmarkItemProps {
  audio: {
    id: string;
    judul: string;
    slug: string;
    durasi: number;
    cover?: string | null;
    series: { judul: string; slug: string };
  };
}

export function BookmarkItem({ audio }: BookmarkItemProps) {
  return (
    <Link
      href={`/audio/${audio.slug}`}
      className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-3 transition-all hover:shadow-sm hover:border-brand/30"
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-brand/10">
        {audio.cover ? (
          <Image src={audio.cover} alt={audio.judul} fill sizes="56px" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-brand/10 text-brand">
            <AudioLines className="h-6 w-6" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium group-hover:text-brand">{audio.judul}</p>
        <p className="mt-1 text-xs text-muted">{audio.series.judul}</p>
        <p className="mt-1 text-xs text-muted">{formatDuration(audio.durasi)}</p>
      </div>
    </Link>
  );
}

interface BookmarksListProps {
  bookmarks: {
    id: string;
    judul: string;
    slug: string;
    durasi: number;
    cover?: string | null;
    series: { judul: string; slug: string };
  }[];
}

export function BookmarksList({ bookmarks }: BookmarksListProps) {
  if (bookmarks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
        <p className="text-muted">Belum ada bookmark</p>
        <p className="mt-1 text-sm text-muted">Bookmark audio untuk mengaksesnya di sini</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {bookmarks.map((audio) => (
        <Link key={audio.id} href={`/audio/${audio.slug}`}>
          <div className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-3 transition-all hover:shadow-sm hover:border-brand/30">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-brand/10">
              {audio.cover ? (
                <Image src={audio.cover} alt={audio.judul} fill sizes="56px" className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-brand/10 text-brand">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.776a1 1 0 01-1.438.894l-4.553-2.276A1 1 0 0010 10.776V7.224a1 1 0 011.438-.894l4.553 2.276a1 1 0 00.562-1.788z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium group-hover:text-brand">{audio.judul}</p>
              <p className="truncate text-xs text-muted">{audio.series.judul}</p>
              <p className="text-[10px] text-muted">{formatDuration(audio.durasi)}</p>
            </div>

            <span className="shrink-0 text-muted group-hover:text-brand">
              ▶
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}