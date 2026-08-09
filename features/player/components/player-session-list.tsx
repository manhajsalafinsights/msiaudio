"use client";

import Link from "next/link";
import { Play, Check } from "lucide-react";
import { cn } from "@/utils/cn";
import { formatDurationHuman } from "@/utils/duration";

interface Session {
  id: string;
  slug: string;
  number: number;
  title: string;
  duration: number;
  isCompleted: boolean;
  isCurrent: boolean;
}

interface SessionListProps {
  seriesTitle: string;
  sessions: Session[];
}

export function SessionList({ seriesTitle, sessions }: SessionListProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{seriesTitle}</h3>
        <span className="text-sm text-muted">{sessions.length} Sesi</span>
      </div>

      <div className="flex flex-col gap-2">
        {sessions.map((session) => (
          <SessionItem key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
}

interface SessionItemProps {
  session: Session;
}

function SessionItem({ session }: SessionItemProps) {
  const { slug, number, title, duration, isCompleted, isCurrent } = session;

  return (
    <Link
      href={`/audio/${slug}`}
      className={cn(
        "group flex items-center gap-4 rounded-xl border p-4 text-left transition-all duration-200",
        isCurrent
          ? "border-brand/30 bg-brand/5 shadow-sm"
          : "border-border bg-surface hover:border-brand/20 hover:shadow-sm",
      )}
    >
      {/* Status icon */}
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          isCompleted
            ? "bg-success/10 text-success"
            : isCurrent
              ? "bg-brand text-white"
              : "bg-brand/10 text-brand group-hover:bg-brand group-hover:text-white",
        )}
      >
        {isCompleted ? (
          <Check className="h-5 w-5" />
        ) : isCurrent ? (
          <Play className="h-5 w-5 fill-current" />
        ) : (
          <span className="text-sm font-medium">{number}</span>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className={cn(
          "truncate text-sm font-medium",
          isCurrent ? "text-brand" : "text-foreground",
        )}>
          {title}
        </p>
        <p className="text-xs text-muted">{formatDurationHuman(duration)}</p>
      </div>

      {/* Current indicator */}
      {isCurrent ? (
        <span className="shrink-0 rounded-full bg-brand/10 px-2 py-1 text-xs font-medium text-brand">
          Sedang Diputar
        </span>
      ) : (
        <span className="shrink-0 text-xs font-medium text-muted opacity-0 transition-opacity group-hover:opacity-100">
          Putar
        </span>
      )}
    </Link>
  );
}
