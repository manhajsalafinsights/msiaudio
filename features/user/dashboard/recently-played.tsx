import Link from "next/link";
import Image from "next/image";
import { History, Play, CheckCircle2 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { formatDurationHuman } from "@/utils/duration";
import { formatDistanceToNow } from "@/utils/date";

interface RecentlyPlayedProps {
  items: {
    id: string;
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
  }[];
}

export function RecentlyPlayed({ items }: RecentlyPlayedProps) {
  return (
    <section className="flex flex-col gap-4" aria-label="Terakhir diputar">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Terakhir Diputar</h2>
        <Button asChild variant="ghost" size="sm">
          <Link href="/user/dashboard/history">Lihat semua</Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={History}
          title="Belum ada audio diputar"
          description="Kajian yang kamu dengarkan akan muncul di sini."
          action={
            <Button asChild>
              <Link href="/explore">Jelajahi Series</Link>
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/audio/${item.audio.slug}`}
                className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-3 transition-all hover:border-brand/30 hover:shadow-sm"
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
                      <Play className="h-5 w-5" />
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
                    {item.audio.series.judul} · Sesi {item.audio.nomorSesi} ·{" "}
                    {formatDurationHuman(item.audio.durasi)}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {formatDistanceToNow(new Date(item.lastPlayedAt))}
                    {item.playCount > 1 ? ` · ${item.playCount}x diputar` : ""}
                  </p>
                </div>

                {!item.completed && (
                  <div className="hidden w-24 shrink-0 sm:block">
                    <ProgressBar value={item.progressPercent} />
                    <p className="mt-1 text-right text-xs font-medium text-brand">
                      {Math.round(item.progressPercent)}%
                    </p>
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
