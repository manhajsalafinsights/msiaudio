import Link from "next/link";
import { Clock, ListMusic } from "lucide-react";
import { formatDurationHuman } from "@/utils/duration";
import type { SeriesPublic } from "@/repositories/series-repository";
import { Cover } from "@/components/shared/cover";
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
    <Link href={`/series/${series.slug}`} className="group block">
      <div className="card card-interactive p-3">
        <Cover src={series.cover} alt={series.judul} className="w-full rounded-xl" />
        <div className="mt-3">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-brand">
            {series.judul}
          </h3>
          {speakerNames && (
            <p className="mt-1 line-clamp-1 text-xs text-muted">{speakerNames}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted">
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
            <div className="mt-2 flex items-center gap-2">
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
