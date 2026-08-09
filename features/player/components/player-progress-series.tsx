"use client";

import { Check } from "lucide-react";

interface ProgressSeriesProps {
  totalSessions: number;
  completedSessions: number;
  currentSession: number;
}

export function ProgressSeries({ totalSessions, completedSessions, currentSession }: ProgressSeriesProps) {
  const percent = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
  const isCompleted = completedSessions === totalSessions;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Progress Series</h3>
        {isCompleted ? (
          <span className="flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
            <Check className="h-3.5 w-3.5" />
            Series Selesai
          </span>
        ) : (
          <span className="text-sm font-medium text-brand">{percent}%</span>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand to-brand-light transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Stats */}
      <div className="mt-3 flex items-center justify-between text-xs text-muted">
        <span>{completedSessions} dari {totalSessions} sesi selesai</span>
        <span>Sesi {currentSession} sedang diputar</span>
      </div>
    </div>
  );
}
