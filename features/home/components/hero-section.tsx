"use client";

import type { ReactNode } from "react";

export default function HeroSection({ stats }: { stats?: ReactNode }) {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-b from-brand/10 via-brand/[0.04] to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-surface/70 px-3 py-1 text-xs font-medium text-brand backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-brand" />
            Platform Audio Kajian Islam
          </span>
          {stats}
        </div>
      </div>
    </section>
  );
}
