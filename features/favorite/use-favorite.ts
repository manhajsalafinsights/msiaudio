"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export function useFavorite(seriesId: string) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    if (!seriesId) return;
    let active = true;
    fetch(`/api/favorites?seriesId=${seriesId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data) setFavorited(data.favorited);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [seriesId]);

  const toggleFavorite = useCallback(async () => {
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seriesId }),
    });
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (res.ok) {
      const data = await res.json();
      setFavorited(data.favorited);
    }
  }, [seriesId, router]);

  return { favorited, toggleFavorite };
}
