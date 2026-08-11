"use client";

import Link from "next/link";
import { Play, Check } from "lucide-react";
import { cn } from "@/utils/cn";
import { formatDuration } from "@/utils/duration";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { AudioCard } from "@/repositories/audio-repository";

type SessionRowProps = {
  audio: AudioCard;
  /** Nomor sesi (1-based) — wajib sesuai nomorSesi audio. */
  nomor: number;
  completed?: boolean;
  progressPercent?: number;
};

/** Baris sesi dalam detail series — nomor, judul, durasi, status selesai, progress, tombol play. */
export function SessionRow({ audio, nomor, completed = false, progressPercent = 0 }: SessionRowProps) {
  return (
    <li>
      <Link
        href={`/audio/${audio.slug}`}
        className="group flex items-center gap-4 rounded-xl border border-border bg-surface px-4 py-3 transition-all hover:border-brand/20 hover:shadow-sm"
      >
        <span
          className={cn(
            "relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg transition-all",
            completed
              ? "bg-success/10 text-success"
              : "bg-brand/10 text-brand group-hover:bg-brand group-hover:text-white",
          )}
        >
          {completed ? (
            <Check className="h-4 w-4" aria-label="Selesai didengarkan" />
          ) : (
            <>
              {/* Mini CD yang berputar saat hover */}
              <span
                className="group-hover:animate-spin-slow motion-reduce:group-hover:animate-none absolute inset-0 flex items-center justify-center"
                aria-hidden
              >
                <span className="relative h-8 w-8 rounded-full">
                  <span
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        "radial-gradient(circle at 32% 28%, #fdfdfe 0%, #d7dce3 16%, #b4bcc7 32%, #8b95a3 50%, #5c6575 68%, #353b47 84%, #242830 100%)",
                    }}
                  />
                  <span className="absolute inset-[10%] rounded-full border border-white/25" />
                  <span className="absolute inset-[16%] rounded-full border border-white/15" />
                  <span className="absolute inset-[22%] rounded-full border border-black/20" />
                  <span className="absolute left-1/2 top-[2%] h-[44%] w-[12%] -translate-x-1/2 rounded-full bg-white/35 blur-[1px]" />
                </span>
              </span>
              <span className="relative z-10 text-[11px] font-semibold tabular-nums group-hover:hidden">
                {nomor}
              </span>
              <Play
                className="relative z-10 hidden h-4 w-4 fill-current group-hover:block"
                aria-hidden
              />
            </>
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="block truncate text-sm font-medium">{audio.judul}</span>
            {completed && (
              <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                Selesai
              </span>
            )}
          </span>
          {progressPercent > 0 && !completed && (
            <span className="mt-1.5 block max-w-xs">
              <ProgressBar value={progressPercent} />
            </span>
          )}
        </span>

        <span className="shrink-0 text-xs tabular-nums text-muted">
          {formatDuration(audio.durasi)}
        </span>
      </Link>
    </li>
  );
}
