"use client";

import { useState, useEffect, useCallback } from "react";

export function useBookmark(audioId: string) {
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    if (!audioId) return;
    let active = true;
    fetch(`/api/bookmark/check?audioId=${audioId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data) setBookmarked(data.bookmarked);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [audioId]);

  const toggleBookmark = useCallback(async () => {
    try {
      const res = await fetch("/api/bookmark/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioId }),
      });
      if (res.ok) {
        const data = await res.json();
        setBookmarked(data.bookmarked);
      }
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
    }
  }, [audioId]);

  return { bookmarked, toggleBookmark };
}
