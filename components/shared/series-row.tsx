import Link from "next/link";
import { ListMusic, Clock } from "lucide-react";
import { cn } from "@/utils/cn";
import { formatDurationHuman } from "@/utils/duration";
import type { SeriesPublic } from "@/repositories/series-repository";

type SeriesRowProps = {
  series: SeriesPublic;
  className?: string;
};

export function SeriesRow({ series, className }: SeriesRowProps) {
  const speakerNames = series.speakers.map((s) => s.speaker.nama).join(", ");

  return (
    <li>
      <Link
        href={`/series/${series.slug}`}
        className={cn(
          "group flex items-center gap-4 rounded-xl border border-border bg-surface px-4 py-3",
          "transition-all hover:border-brand/20 hover:shadow-sm",
          className,
        )}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand transition-all group-hover:bg-brand group-hover:text-white">
          <ListMusic className="h-4 w-4" aria-hidden />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{series.judul}</span>
          {speakerNames && (
            <span className="block truncate text-xs text-muted">{speakerNames}</span>
          )}
        </span>

        <span className="hidden shrink-0 items-center gap-3 text-xs text-muted sm:flex">
          <span className="inline-flex items-center gap-1">
            <ListMusic className="h-3 w-3" aria-hidden />
            {series.totalSesi} sesi
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden />
            {formatDurationHuman(series.totalDurasi)}
          </span>
        </span>

        <span className="shrink-0 text-xs tabular-nums text-muted sm:hidden">
          {series.totalSesi} sesi
        </span>
      </Link>
    </li>
  );
}
