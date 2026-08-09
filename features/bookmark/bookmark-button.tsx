"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "@/utils/cn";

interface BookmarkButtonProps {
  audioId: string;
  initialBookmarked?: boolean;
}

export function BookmarkButton({ audioId, initialBookmarked = false }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={cn(
        "rounded-full p-2 transition-all duration-150 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "flex items-center justify-center",
        "text-muted hover:text-brand hover:bg-brand/5",
        "active:scale-95",
      )}
      aria-label={bookmarked ? "Hapus bookmark" : "Bookmark"}
    >
      {bookmarked ? (
        <BookmarkCheck className="h-5 w-5 fill-current text-brand" />
      ) : (
        <Bookmark className="h-5 w-5" />
      )}
    </button>
  );
}