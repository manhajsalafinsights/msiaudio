import Link from "next/link";
import { Headset } from "lucide-react";
import type { SeriesPublic } from "@/repositories/series-repository";

export function SeriesCardCompact({ series }: { series: SeriesPublic }) {
  return (
    <Link
      href={`/series/${series.slug}`}
      className="card card-glass group flex items-center gap-3 p-4"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
        <Headset className="h-5 w-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold leading-snug group-hover:text-brand">
          {series.judul}
        </span>
        <span className="block text-xs text-muted">{series.totalSesi} sesi</span>
      </span>
    </Link>
  );
}
