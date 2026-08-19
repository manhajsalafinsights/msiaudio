import Link from "next/link";
import { Play } from "lucide-react";
import { cn } from "@/utils/cn";
import { formatDuration } from "@/utils/duration";
import { Cover } from "@/components/shared/cover";
import { AudioDisc } from "@/components/shared/audio-disc";
import type { AudioCard } from "@/repositories/audio-repository";

type AudioCardProps = {
  audio: AudioCard;
  className?: string;
};

export function AudioCard({ audio, className }: AudioCardProps) {
  const speakerName = audio.series?.speakers[0]?.speaker.nama;
  const meta = speakerName ?? audio.series?.judul;
  const isYouTube = audio.mediaSources[0]?.provider === "YOUTUBE";

  return (
    <div className={cn("group relative h-full rounded-xl bg-surface p-3 transition-colors duration-300 hover:bg-surface-elevated", className)}>
      <Link href={`/audio/${audio.slug}`} className="flex h-full flex-col gap-2.5">
        <span className="relative block aspect-square w-full overflow-hidden rounded-lg shadow-lg shadow-black/20">
          {isYouTube ? (
            <AudioDisc
              src={audio.cover ?? audio.series?.cover}
              alt={audio.judul}
              className="h-full w-full rounded-none"
            />
          ) : (
            <Cover
              src={audio.cover ?? audio.series?.cover}
              alt={audio.judul}
              variant="square"
              className="h-full w-full rounded-none"
            />
          )}

          {/* Tombol play ala Spotify: selalu terlihat di mobile, muncul saat hover di desktop */}
          <span
            className="absolute bottom-2 right-2 flex h-11 w-11 items-center justify-center rounded-full bg-brand text-brand-strong shadow-lg shadow-black/40 transition-all duration-300
              md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-hover:scale-105"
            aria-hidden
          >
            <Play className="ml-0.5 h-5 w-5 fill-current" />
          </span>

          <span className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-0.5 text-xs font-medium tabular-nums text-white backdrop-blur-sm">
            {formatDuration(audio.durasi)}
          </span>
        </span>

        <span className="flex flex-col gap-1 px-0.5">
          <span className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
            {audio.judul}
          </span>
          {meta && <span className="truncate text-xs font-medium text-secondary">{meta}</span>}
        </span>
      </Link>
    </div>
  );
}