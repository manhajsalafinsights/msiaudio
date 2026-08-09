import Link from "next/link";
import { Play } from "lucide-react";
import { cn } from "@/utils/cn";
import { formatDuration } from "@/utils/duration";
import type { AudioCard } from "@/repositories/audio-repository";

type AudioRowProps = {
  audio: AudioCard;
  index?: number;
  className?: string;
};

export function AudioRow({ audio, index, className }: AudioRowProps) {
  return (
    <li>
      <Link
        href={`/audio/${audio.slug}`}
        className={cn(
          "group flex items-center gap-4 rounded-xl border border-border bg-surface px-4 py-3",
          "transition-all hover:border-brand/20 hover:shadow-sm",
          className,
        )}
      >
        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand transition-all group-hover:bg-brand group-hover:text-white">
          {typeof index === "number" ? (
            <span className="text-sm font-semibold group-hover:hidden">{index}</span>
          ) : null}
          <Play className="hidden h-4 w-4 fill-current group-hover:block" aria-hidden />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{audio.judul}</span>
          {audio.series && (
            <span className="block truncate text-xs text-muted">{audio.series.judul}</span>
          )}
        </span>

        <span className="shrink-0 text-xs tabular-nums text-muted">
          {formatDuration(audio.durasi)}
        </span>
      </Link>
    </li>
  );
}
