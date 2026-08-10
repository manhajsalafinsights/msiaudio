import Link from "next/link";
import { Play } from "lucide-react";
import { cn } from "@/utils/cn";
import { formatDuration } from "@/utils/duration";
import { Cover } from "@/components/shared/cover";
import type { AudioCard } from "@/repositories/audio-repository";

type AudioCardProps = {
  audio: AudioCard;
  className?: string;
};

export function AudioCard({ audio, className }: AudioCardProps) {
  return (
    <li className={cn("w-48 flex-none snap-start sm:w-60 lg:w-72", className)}>
      <Link
        href={`/audio/${audio.slug}`}
        className="group flex h-full flex-col gap-2.5 rounded-[0.1px] p-2 transition-colors duration-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.06]"
      >
        <span className="relative block aspect-square w-full overflow-hidden rounded-[0.1px]">
          <Cover
            src={audio.cover ?? audio.series?.cover}
            alt={audio.judul}
            variant="square"
            className="h-full w-full"
          />

          {/* Tombol play: selalu terlihat di mobile, muncul saat hover di desktop */}
          <span
            className="absolute inset-0 flex items-center justify-center rounded-[0.1px]
              md:bg-black/0 md:opacity-0 md:transition-all md:duration-200
              md:group-hover:bg-black/25 md:group-hover:opacity-100"
            aria-hidden
          >
            <span
              className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white shadow-lg shadow-brand/30
                transition-transform duration-200 group-hover:scale-105"
            >
              <Play className="ml-0.5 h-6 w-6 fill-current" />
            </span>
          </span>

          <span className="absolute bottom-1.5 right-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-white backdrop-blur-sm">
            {formatDuration(audio.durasi)}
          </span>
        </span>

        <span className="flex flex-col gap-0.5 px-0.5">
          <span className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-brand">
            {audio.judul}
          </span>
          {audio.series && (
            <span className="truncate text-xs text-muted">{audio.series.judul}</span>
          )}
        </span>
      </Link>
    </li>
  );
}
