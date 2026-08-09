import Link from "next/link";
import Image from "next/image";
import { Mic, ListMusic, Headphones } from "lucide-react";
import { formatCount } from "@/utils/format";

type PemateriCardProps = {
  pemateri: {
    nama: string;
    slug: string;
    foto: string | null;
    bio: string | null;
    seriesCount: number;
    totalAudio: number;
  };
};

export function PemateriCard({ pemateri }: PemateriCardProps) {
  return (
    <Link href={`/pemateri/${pemateri.slug}`} className="card card-interactive flex items-center gap-3 p-4">
      {pemateri.foto ? (
        <Image
          src={pemateri.foto}
          alt={pemateri.nama}
          width={48}
          height={48}
          className="h-12 w-12 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
          <Mic className="h-5 w-5" aria-hidden />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold group-hover:text-brand">
          {pemateri.nama}
        </span>
        <span className="mt-1 flex items-center gap-3 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <ListMusic className="h-3 w-3" aria-hidden />
            {formatCount(pemateri.seriesCount)} series
          </span>
          <span className="inline-flex items-center gap-1">
            <Headphones className="h-3 w-3" aria-hidden />
            {formatCount(pemateri.totalAudio)} audio
          </span>
        </span>
      </span>
    </Link>
  );
}
