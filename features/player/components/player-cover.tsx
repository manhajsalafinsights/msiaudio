"use client";

import { Headphones } from "lucide-react";
import { cn } from "@/utils/cn";

interface PlayerCoverProps {
  alt: string;
  isPlaying: boolean;
}

/** CD (piringan) yang dimiringkan dan berputar saat diputar. */
export function PlayerCover({ alt, isPlaying }: PlayerCoverProps) {
  return (
    <div className="relative flex items-center justify-center py-2" style={{ perspective: "1200px" }}>
      {/* Dynamic glow effect */}
      <div
        className={cn(
          "absolute inset-4 rounded-full bg-brand/10 blur-3xl transition-opacity duration-700",
          isPlaying ? "opacity-100" : "opacity-0",
        )}
        aria-hidden
      />

      {/* Tilted stage */}
      <div
        className="relative h-72 w-72 lg:h-80 lg:w-80"
        style={{ transform: "rotateX(16deg) rotateZ(-8deg)", transformStyle: "preserve-3d" }}
      >
        {/* Platter shadow */}
        <div
          className="absolute inset-2 rounded-full bg-black/50 blur-xl transition-opacity duration-500"
          style={{ transform: "translateZ(-40px)" }}
          aria-hidden
        />

        {/* Spinning disc */}
        <div
          className={cn(
            "relative h-full w-full rounded-full transition-[filter] duration-500",
            isPlaying && "animate-spin-slow motion-reduce:animate-none",
            !isPlaying && "brightness-[0.9] saturate-[0.9]",
          )}
          style={{ animationDuration: isPlaying ? "8s" : undefined, animationTimingFunction: "linear" }}
          role="img"
          aria-label={isPlaying ? `${alt} — sedang diputar` : alt}
        >
          {/* CD body */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 32% 28%, #fdfdfe 0%, #d7dce3 16%, #b4bcc7 32%, #8b95a3 50%, #5c6575 68%, #353b47 84%, #242830 100%)",
            }}
            aria-hidden
          />

          {/* Groove rings */}
          <div className="absolute inset-[5%] rounded-full border border-white/15" aria-hidden />
          <div className="absolute inset-[9%] rounded-full border border-white/10" aria-hidden />
          <div className="absolute inset-[13%] rounded-full border border-black/15" aria-hidden />

          {/* Label (bukan cover — agar sumber audio tidak terlihat) */}
          <div className="absolute inset-[19%] flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand to-brand-strong ring-4 ring-black/25">
            <Headphones className="h-2/5 w-2/5 text-white/90" aria-hidden />
          </div>

          {/* Center spindle */}
          <div className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-950 ring-4 ring-black/40" aria-hidden />
        </div>

        {/* Static sheen (di luar disc agar tidak ikut berputar) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full" aria-hidden>
          <div
            className="absolute -left-1/3 -top-1/3 h-[130%] w-[70%] rotate-[24deg] opacity-30"
            style={{
              background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.9) 50%, transparent 70%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
