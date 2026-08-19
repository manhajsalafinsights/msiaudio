import Link from "next/link";
import { Clock, ListMusic, Play } from "lucide-react";
import { formatDurationHuman } from "@/utils/duration";
import type { SeriesPublic } from "@/repositories/series-repository";
import { AudioTape } from "@/components/shared/audio-tape";
import { ProgressBar } from "@/components/ui/progress-bar";

export function SeriesCard({
  series,
  progressPercent,
  progressLabel,
}: {
  series: SeriesPublic;
  /** 0–100; opsional — hanya ditampilkan jika user login & punya progress. */
  progressPercent?: number;
  progressLabel?: string;
}) {
  const speakerNames = series.speakers.map((s) => s.speaker.nama).join(", ");

  return (
    <Link href={`/series/${series.slug}`} className="group block h-full">
      <div className="flex h-full flex-col rounded-xl bg-surface p-3 transition-colors duration-300 hover:bg-surface-elevated">
        <span className="relative block aspect-video w-full overflow-hidden rounded-lg shadow-lg shadow-black/20">
          <AudioTape src={series.cover} alt={series.judul} className="h-full w-full rounded-none" />

          {/* Tombol play ala Spotify */}
          <span
            className="absolute bottom-2 right-2 flex h-11 w-11 items-center justify-center rounded-full bg-brand text-brand-strong shadow-lg shadow-black/40 transition-all duration-300
              md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-hover:scale-105"
            aria-hidden
          >
            <Play className="ml-0.5 h-5 w-5 fill-current" />
          </span>
        </span>

        <div className="mt-3 flex flex-1 flex-col">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
            {series.judul}
          </h3>
          {speakerNames && (
            <p className="mt-1 line-clamp-1 text-xs font-medium text-secondary">{speakerNames}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted">
            <span className="inline-flex items-center gap-1">
              <ListMusic className="h-3 w-3" aria-hidden />
              {series.totalSesi} sesi
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden />
              {formatDurationHuman(series.totalDurasi)}
            </span>
          </div>
          {typeof progressPercent === "number" && progressPercent > 0 && (
            <div className="mt-auto flex items-center gap-2 pt-3">
              <ProgressBar value={progressPercent} className="h-1 flex-1" />
              <span className="shrink-0 text-xs font-medium text-brand">
                {progressLabel ?? `${Math.round(progressPercent)}%`}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}