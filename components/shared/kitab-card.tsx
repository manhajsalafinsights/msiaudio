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
      className="group flex items-center gap-3 rounded-2xl bg-surface p-4 shadow-xs transition-all hover:shadow-md"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand">
        <BookOpen className="h-6 w-6" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold group-hover:text-brand">
          {kitab.nama}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3.5 w-3.5 text-brand/70" aria-hidden />
            {formatCompactCount(kitab.viewCount)} dilihat
          </span>
          <span>{formatCount(kitab.seriesCount)} series</span>
        </span>
      </span>
    </TrackViewLink>
  );
}
