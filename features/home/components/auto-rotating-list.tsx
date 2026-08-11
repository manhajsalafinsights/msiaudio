"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

type Breakpoint = "sm" | "md" | "lg" | "xl";

type SlidesPerView = {
  base: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
};

const BREAKPOINTS: Array<{ key: Breakpoint; query: string }> = [
  { key: "xl", query: "(min-width: 1280px)" },
  { key: "lg", query: "(min-width: 1024px)" },
  { key: "md", query: "(min-width: 768px)" },
  { key: "sm", query: "(min-width: 640px)" },
];

// Lebar kartu memakai calc() agar tepat N kartu muat per baris termasuk gap
// (gap-3 = 12px), sehingga tidak ada kartu berikutnya yang "kepepet" kelihatan.
const WIDTH_CLASSES: Record<string, Record<number, string>> = {
  base: {
    2: "w-[calc(50%-6px)]",
    3: "w-[calc(33.333%-8px)]",
    4: "w-[calc(25%-9px)]",
  },
  sm: {
    2: "sm:w-[calc(50%-6px)]",
    3: "sm:w-[calc(33.333%-8px)]",
    4: "sm:w-[calc(25%-9px)]",
  },
  md: {
    2: "md:w-[calc(50%-6px)]",
    3: "md:w-[calc(33.333%-8px)]",
    4: "md:w-[calc(25%-9px)]",
  },
  lg: {
    2: "lg:w-[calc(50%-6px)]",
    3: "lg:w-[calc(33.333%-8px)]",
    4: "lg:w-[calc(25%-9px)]",
    5: "lg:w-[calc(20%-9.6px)]",
  },
  xl: {
    3: "xl:w-[calc(33.333%-8px)]",
    4: "xl:w-[calc(25%-9px)]",
    5: "xl:w-[calc(20%-9.6px)]",
  },
};

function getWidthClass(config: SlidesPerView): string {
  const parts: string[] = [];
  const baseValue = config.base;
  if (baseValue != null && WIDTH_CLASSES.base[baseValue]) {
    parts.push(WIDTH_CLASSES.base[baseValue]);
  }
  for (const bp of BREAKPOINTS) {
    const value = config[bp.key];
    if (value != null && WIDTH_CLASSES[bp.key][value]) {
      parts.push(WIDTH_CLASSES[bp.key][value]);
    }
  }
  return parts.join(" ");
}

function resolveSlidesPerView(config: SlidesPerView): number {
  if (typeof window === "undefined") return config.base;
  for (const bp of BREAKPOINTS) {
    const value = config[bp.key];
    if (value != null && window.matchMedia(bp.query).matches) return value;
  }
  return config.base;
}

type AutoRotatingListProps = {
  items: ReactNode[];
  slidesPerView: SlidesPerView;
  intervalMs?: number;
  className?: string;
  ariaLabel?: string;
};

/**
 * Daftar kartu yang berganti otomatis (auto-rotating carousel).
 * Slide awal dikloning di akhir sehingga perulangannya mulus tanpa rewind terlihat.
 */
export function AutoRotatingList({
  items,
  slidesPerView,
  intervalMs = 4500,
  className,
  ariaLabel = "Daftar kartu yang berganti otomatis",
}: AutoRotatingListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const [spv, setSpv] = useState(() => resolveSlidesPerView(slidesPerView));
  const [position, setPosition] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const update = () => setSpv(resolveSlidesPerView(slidesPerView));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [slidesPerView]);

  const getStep = useCallback(() => {
    const track = trackRef.current;
    const li = track?.firstElementChild as HTMLElement | null;
    if (!track || !li) return 0;
    const gap = parseFloat(getComputedStyle(track).gap || "0");
    return li.offsetWidth + gap;
  }, []);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;
    const step = getStep();
    if (step <= 0) return;
    const maxPos = Math.round((track.scrollWidth - container.clientWidth) / step);
    let pos = Math.round(container.scrollLeft / step);
    if (pos >= maxPos) pos = 0;
    setPosition(Math.min(pos, Math.max(0, items.length - 1)));
  }, [getStep, items.length]);

  useEffect(() => {
    const onResize = () => {
      const container = containerRef.current;
      const track = trackRef.current;
      if (!container || !track) return;
      const maxScroll = Math.max(0, track.scrollWidth - container.clientWidth);
      if (container.scrollLeft > maxScroll) {
        container.scrollTo({ left: maxScroll, behavior: "auto" });
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (paused || items.length <= spv) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = setInterval(() => {
      const container = containerRef.current;
      const track = trackRef.current;
      if (!container || !track) return;
      const maxScroll = Math.max(0, track.scrollWidth - container.clientWidth);
      if (maxScroll <= 0) return;
      const step = getStep();
      if (step <= 0) return;
      const next = container.scrollLeft + step;
      if (next >= maxScroll - 4) {
        container.scrollTo({ left: 0, behavior: "auto" });
      } else {
        container.scrollTo({ left: next, behavior: "smooth" });
      }
    }, intervalMs);
    return () => clearInterval(id);
  }, [paused, items.length, spv, intervalMs, getStep]);

  const go = useCallback(
    (dir: 1 | -1) => {
      const container = containerRef.current;
      const track = trackRef.current;
      if (!container || !track) return;
      const maxScroll = Math.max(0, track.scrollWidth - container.clientWidth);
      const step = getStep();
      if (step <= 0) return;
      if (dir === -1 && container.scrollLeft < step / 2) {
        container.scrollTo({ left: maxScroll, behavior: "auto" });
        return;
      }
      const target = Math.max(0, Math.min(container.scrollLeft + dir * step, maxScroll));
      container.scrollTo({ left: target, behavior: "smooth" });
    },
    [getStep],
  );

  const jumpTo = useCallback(
    (index: number) => {
      const container = containerRef.current;
      if (!container) return;
      const step = getStep();
      if (step <= 0) return;
      container.scrollTo({ left: index * step, behavior: "smooth" });
    },
    [getStep],
  );

  const canScroll = items.length > spv;
  const slides = canScroll ? [...items, ...items.slice(0, spv)] : items;
  const widthClass = getWidthClass(slidesPerView);

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onPointerDown={() => setPaused(true)}
      onPointerUp={() => setPaused(false)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        ref={containerRef}
        onScroll={handleScroll}
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
        className={cn(
          "-mx-4 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 md:mx-0 md:px-0",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        <ul ref={trackRef} className="flex w-full gap-3">
          {slides.map((slide, i) => (
            <li key={i} className={cn("flex-none", widthClass)}>
              {slide}
            </li>
          ))}
        </ul>
      </div>

      {canScroll && (
        <>
          <button
            type="button"
            aria-label="Sebelumnya"
            onClick={() => go(-1)}
            className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface/80 p-2 text-foreground shadow-sm backdrop-blur transition-all duration-200 hover:bg-surface hover:text-brand md:flex"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Berikutnya"
            onClick={() => go(1)}
            className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface/80 p-2 text-foreground shadow-sm backdrop-blur transition-all duration-200 hover:bg-surface hover:text-brand md:flex"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="mt-3 flex justify-center gap-1.5">
            {Array.from({ length: items.length }).map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Pergi ke item ${i + 1}`}
                onClick={() => jumpTo(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === position ? "w-5 bg-brand" : "w-1.5 bg-border hover:bg-muted",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
