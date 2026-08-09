"use client";

import { useEffect, useState } from "react";

type InfiniteScrollOptions = {
  hasMore: boolean;
  onLoadMore: () => void;
  loading?: boolean;
  rootMargin?: string;
};

/**
 * Muat berikutnya saat elemen sentinel terlihat (infinite scroll).
 * Gunakan bersama list; sentinel dirender di bawah daftar.
 */
export function useInfiniteScroll({
  hasMore,
  onLoadMore,
  loading = false,
  rootMargin = "200px",
}: InfiniteScrollOptions) {
  const [sentinelRef, setSentinelRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!sentinelRef || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin },
    );

    observer.observe(sentinelRef);
    return () => observer.disconnect();
  }, [sentinelRef, hasMore, loading, onLoadMore, rootMargin]);

  return setSentinelRef;
}
