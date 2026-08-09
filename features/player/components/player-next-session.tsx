"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { Cover } from "@/components/shared/cover";

interface NextSessionProps {
  title: string;
  seriesTitle: string;
  sessionNumber: number;
  duration: string;
  cover?: string | null;
  onClick?: () => void;
}

export function NextSession({
  title,
  seriesTitle,
  sessionNumber,
  duration,
  cover,
  onClick,
}: NextSessionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "card-msi flex w-full items-center gap-4 p-4 text-left",
        "hover:border-brand/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50",
      )}
    >
      {/* Cover thumbnail */}
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
        <Cover src={cover} alt={title} variant="square" className="h-full w-full rounded-none" />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted">Sesi Berikutnya</p>
        <p className="truncate text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted">
          {seriesTitle} · Sesi {sessionNumber} · {duration}
        </p>
      </div>

      {/* Arrow */}
      <ChevronRight className="h-5 w-5 shrink-0 text-muted" aria-hidden />
    </button>
  );
}
