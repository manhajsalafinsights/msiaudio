"use client";

import { Headphones } from "lucide-react";
import { Cover } from "@/components/shared/cover";
import { cn } from "@/utils/cn";

interface PlayerCoverProps {
  src: string | null;
  alt: string;
  isPlaying: boolean;
}

export function PlayerCover({ src, alt, isPlaying }: PlayerCoverProps) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Dynamic glow effect */}
      <div
        className={cn(
          "absolute inset-0 rounded-full bg-brand/10 blur-3xl transition-opacity duration-700",
          isPlaying ? "opacity-100" : "opacity-0",
        )}
        aria-hidden
      />

      {/* Cover with floating animation */}
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl shadow-2xl transition-all duration-500",
          "h-72 w-72 md:h-80 md:w-80",
          isPlaying && "animate-float shadow-glow",
        )}
      >
        {src ? (
          <Cover
            src={src}
            alt={alt}
            variant="square"
            className="h-full w-full"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand to-brand-strong">
            <Headphones className="h-16 w-16 text-white/90" aria-hidden />
          </div>
        )}

        {/* Playing indicator */}
        {isPlaying && (
          <div className="absolute bottom-4 right-4 flex items-end gap-1 rounded-xl bg-black/50 px-3 py-2 backdrop-blur-sm">
            <span className="w-1 animate-eq1 rounded-full bg-white" style={{ height: "14px" }} />
            <span className="w-1 animate-eq2 rounded-full bg-white" style={{ height: "14px" }} />
            <span className="w-1 animate-eq3 rounded-full bg-white" style={{ height: "14px" }} />
          </div>
        )}
      </div>
    </div>
  );
}
