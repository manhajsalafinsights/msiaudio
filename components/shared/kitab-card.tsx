import { Eye } from "lucide-react";
import { formatCount, formatCompactCount } from "@/utils/format";
import { TrackViewLink } from "@/components/shared/track-view-link";
import { AudioDisc } from "@/components/shared/audio-disc";

type KitabCardProps = {
  kitab: {
    nama: string;
    slug: string;
    icon: string | null;
    description: string | null;
    seriesCount: number;
    viewCount: number;
    cover: string | null;
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
      <span className="relative block aspect-square w-full overflow-hidden rounded-lg shadow-lg shadow-black/20">
        <AudioDisc
          src={kitab.cover}
          alt={kitab.nama}
          className="h-full w-full rounded-none"
          hideBadge
        />
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