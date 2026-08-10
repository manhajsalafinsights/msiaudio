import { BookOpen, Eye } from "lucide-react";
import { formatCount, formatCompactCount } from "@/utils/format";
import { TrackViewLink } from "@/components/shared/track-view-link";

type KitabCardProps = {
  kitab: {
    nama: string;
    slug: string;
    icon: string | null;
    description: string | null;
    seriesCount: number;
    viewCount: number;
  };
};

export function KitabCard({ kitab }: KitabCardProps) {
  return (
    <TrackViewLink
      href={`/kitab/${kitab.slug}`}
      kind="kitab"
      slug={kitab.slug}
      className="card card-interactive group flex items-center gap-3 p-4"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
        <BookOpen className="h-5 w-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold group-hover:text-brand">
          {kitab.nama}
        </span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-muted">
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3 w-3 text-brand/70" aria-hidden />
            {formatCompactCount(kitab.viewCount)} dilihat
          </span>
          <span>{formatCount(kitab.seriesCount)} series</span>
        </span>
      </span>
    </TrackViewLink>
  );
}
