import { Headset, Eye } from "lucide-react";
import { formatCompactCount } from "@/utils/format";
import { TrackViewLink } from "@/components/shared/track-view-link";
import type { SeriesPublic } from "@/repositories/series-repository";

export function SeriesCardCompact({ series }: { series: SeriesPublic }) {
  return (
    <TrackViewLink
      href={`/series/${series.slug}`}
      kind="series"
      slug={series.slug}
      className="card card-glass group flex items-center gap-3 p-4"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
        <Headset className="h-5 w-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold leading-snug group-hover:text-brand">
          {series.judul}
        </span>
        <span className="mt-0.5 flex items-center gap-1 text-[11px] text-muted">
          <Eye className="h-3 w-3 text-brand/70" aria-hidden />
          {formatCompactCount(series.viewCount)} dilihat
        </span>
      </span>
    </TrackViewLink>
  );
}
