"use client";

import type { ReactNode } from "react";

export default function HeroSection({
  search,
  stats,
}: {
  search?: ReactNode;
  stats?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-b from-brand/[0.12] via-brand/[0.04] to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-brand shadow-sm">
            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-brand" />
            Platform Audio Kajian Islam
          </span>
          {search}
          {stats}
        </div>
      </div>
    </section>
  );
}
