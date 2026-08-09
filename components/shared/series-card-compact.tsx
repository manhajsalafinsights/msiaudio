import Link from "next/link";
import type { SeriesPublic } from "@/repositories/series-repository";
import { Cover } from "@/components/shared/cover";

export function SeriesCardCompact({ series }: { series: SeriesPublic }) {
  return (
    <Link
      href={`/series/${series.slug}`}
      className="card card-glass group flex items-center gap-3 p-4"
    >
      <Cover
        src={series.cover}
        alt={series.judul}
        variant="square"
        className="h-11 w-11 shrink-0"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold leading-snug group-hover:text-brand">
          {series.judul}
        </span>
        <span className="block text-xs text-muted">{series.totalSesi} sesi</span>
      </span>
    </Link>
  );
}
