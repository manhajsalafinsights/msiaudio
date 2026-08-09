import Link from "next/link";
import { BookOpen } from "lucide-react";
import { formatCount } from "@/utils/format";

type KitabCardProps = {
  kitab: {
    nama: string;
    slug: string;
    icon: string | null;
    description: string | null;
    seriesCount: number;
  };
};

export function KitabCard({ kitab }: KitabCardProps) {
  return (
    <Link
      href={`/kitab/${kitab.slug}`}
      className="card card-interactive group flex items-center gap-3 p-4"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
        <BookOpen className="h-5 w-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold group-hover:text-brand">
          {kitab.nama}
        </span>
        <span className="block text-xs text-muted">
          {formatCount(kitab.seriesCount)} series
        </span>
      </span>
    </Link>
  );
}
