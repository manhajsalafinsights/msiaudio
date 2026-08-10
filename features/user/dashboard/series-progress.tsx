import Link from "next/link";
import Image from "next/image";
import { BookMarked, CheckCircle2, ArrowRight } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatDurationHuman } from "@/utils/duration";
import type { SeriesProgressItem } from "@/repositories/dashboard-repository";

interface SeriesProgressProps {
  inProgress: SeriesProgressItem[];
  completed: SeriesProgressItem[];
}

function SeriesRow({ item, isCompleted }: { item: SeriesProgressItem; isCompleted: boolean }) {
  const percent = Math.min(100, Math.max(0, Math.round(item.progressPercent)));

  return (
    <li>
      <Link
        href={`/series/${item.series.slug}`}
        className="group flex items-center gap-3 rounded-xl border border-border bg-surface p-3 transition-all hover:border-brand/30 hover:shadow-sm"
      >
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-brand/10">
          {item.series.cover ? (
            <Image
              src={item.series.cover}
              alt={item.series.judul}
              fill
              sizes="44px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-brand">
              <BookMarked className="h-5 w-5" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium group-hover:text-brand">{item.series.judul}</p>
            {isCompleted && (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-label="Selesai" />
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-muted">
            {item.lastAudio
              ? `${item.lastAudio.judul} · ${formatDurationHuman(item.lastAudio.durasi)}`
              : `${item.completedCount} dari ${item.series.totalSesi} sesi`}
          </p>

          <div className="mt-1.5 flex items-center gap-3">
            <ProgressBar value={percent} className="flex-1" />
            <span className="shrink-0 text-xs font-medium text-brand">
              {isCompleted ? "Selesai" : `${percent}%`}
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}

export function SeriesProgress({ inProgress, completed }: SeriesProgressProps) {
  if (inProgress.length === 0 && completed.length === 0) {
    return (
      <EmptyState
        icon={BookMarked}
        title="Belum ada series yang diikuti"
        description="Mulai belajar sebuah series untuk melihat kemajuanmu."
        action={
          <Button asChild>
            <Link href="/explore">Jelajahi Series</Link>
          </Button>
        }
      />
    );
  }

  return (
    <section className="flex flex-col gap-4" aria-label="Kemajuan series">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Kemajuan Series</h2>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-muted">
            Series Saya
            <span className="text-xs">{inProgress.length}</span>
          </h3>
          {inProgress.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-surface p-4 text-center text-sm text-muted">
              Belum ada series yang sedang berjalan
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {inProgress.map((item) => (
                <SeriesRow key={item.id} item={item} isCompleted={false} />
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-muted">
            Series Selesai
            <span className="text-xs">{completed.length}</span>
          </h3>
          {completed.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-surface p-4 text-center text-sm text-muted">
              Belum ada series yang selesai
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {completed.map((item) => (
                <SeriesRow key={item.id} item={item} isCompleted />
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button asChild variant="ghost" size="sm">
          <Link href="/favorites">
            Lihat series favorit
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </section>
  );
}
