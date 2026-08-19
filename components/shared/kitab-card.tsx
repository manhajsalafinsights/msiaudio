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
      className="group flex flex-col gap-3 rounded-xl bg-surface p-3 transition-colors duration-300 hover:bg-surface-elevated"
    >
      <span className="flex aspect-square w-full items-center justify-center rounded-lg bg-gradient-to-br from-brand/20 to-brand/5 text-brand transition-transform duration-300 group-hover:scale-[1.02]">
        <BookOpen className="h-10 w-10" aria-hidden />
      </span>
      <span className="min-w-0 px-0.5">
        <span className="block truncate text-[15px] font-semibold text-foreground">
          {kitab.nama}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs font-medium text-secondary">
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