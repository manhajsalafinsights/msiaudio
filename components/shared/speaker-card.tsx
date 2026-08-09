import Link from "next/link";
import { UserRound } from "lucide-react";
import { Cover } from "@/components/shared/cover";

type SpeakerCardProps = {
  nama: string;
  slug: string;
  foto?: string | null;
  bio?: string | null;
  seriesCount?: number;
};

export function SpeakerCard({ nama, slug, foto, bio, seriesCount }: SpeakerCardProps) {
  return (
    <Link
      href={`/pemateri/${slug}`}
      className="group flex flex-col items-center gap-3 rounded-lg border border-border bg-surface p-4 text-center shadow-xs transition-shadow hover:shadow-md"
    >
      {foto ? (
        <Cover src={foto} alt={nama} variant="square" className="h-16 w-16" />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-brand">
          <UserRound className="h-8 w-8" aria-hidden />
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold group-hover:text-brand-strong">{nama}</p>
        {seriesCount != null && <p className="text-xs text-muted">{seriesCount} series</p>}
        {bio && <p className="mt-1 line-clamp-2 text-xs text-muted">{bio}</p>}
      </div>
    </Link>
  );
}
