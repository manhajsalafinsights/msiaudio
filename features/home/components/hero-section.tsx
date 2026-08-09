"use client";

import Link from "next/link";
import { Play } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-b from-brand/10 via-brand/[0.04] to-transparent"
        aria-hidden
      />
      <div
        className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-brand-light/20 blur-3xl"
        aria-hidden
      />
      <div
        className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-brand/10 blur-3xl"
        aria-hidden
      />

      <div
        className="absolute right-8 top-1/2 hidden -translate-y-1/2 items-end gap-1.5 opacity-20 lg:flex"
        aria-hidden
      >
        {[10, 18, 26, 16, 30, 22, 12, 24, 14, 20, 28, 16].map((h, i) => (
          <span
            key={i}
            className="w-1.5 rounded-full bg-brand"
            style={{ height: `${h}px`, animationDelay: `${i * 90}ms` }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <div className="flex flex-col items-center gap-5 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-surface/70 px-3 py-1 text-xs font-medium text-brand backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-brand" />
            Platform Audio Kajian Islam
          </span>

          <h1 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-5xl md:leading-[1.15]">
            Dengarkan kajian.
            <br />
            <span className="text-brand-strong dark:text-brand-light">
              Belajar dengan lebih terarah.
            </span>
          </h1>

          <p className="max-w-xl text-sm text-muted md:text-base">
            Ribuan kajian audio yang tersusun berdasarkan kitab, pemateri, tema, dan
            kategori. Lanjutkan dari posisi terakhir di perangkat mana pun.
          </p>

          <div className="mt-2">
            <Link href="/explore" className="btn btn-primary btn-lg">
              <Play className="h-4 w-4 fill-current" aria-hidden />
              Mulai Mendengarkan
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
