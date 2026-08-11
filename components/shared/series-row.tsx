import Link from "next/link";
import { ListMusic, Music } from "lucide-react";
import { cn } from "@/utils/cn";
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
        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand/10 text-brand transition-all group-hover:bg-brand group-hover:text-white">
          <span
            className="group-hover:animate-spin-slow absolute inset-0 flex items-center justify-center"
            aria-hidden
          >
            <span className="relative h-6 w-6 rounded-full bg-zinc-900 ring-2 ring-brand/30 group-hover:ring-white/30">
              <span className="absolute inset-[16%] rounded-full bg-zinc-700" />
              <span className="absolute inset-[44%] rounded-full bg-zinc-900 ring-1 ring-zinc-600" />
              <span className="absolute left-1/2 top-[4%] h-[92%] w-[15%] -translate-x-1/2 rounded-sm bg-zinc-600/80" />
              <span className="absolute left-[4%] top-1/2 h-[15%] w-[92%] -translate-y-1/2 rounded-sm bg-zinc-600/80" />
            </span>
          </span>
          <Music className="relative z-10 h-4 w-4" aria-hidden />
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
        </span>

        <span className="shrink-0 text-xs tabular-nums text-muted sm:hidden">
          {series.totalSesi} sesi
        </span>
      </Link>
    </li>
  );
}
