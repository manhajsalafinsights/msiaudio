"use client";

import { useEffect, useRef, useState } from "react";
import { Bookmark, BookmarkCheck, StickyNote, Share2, Check } from "lucide-react";
import { cn } from "@/utils/cn";
import { useBookmark } from "@/features/bookmark/use-bookmark";

interface QuickActionsProps {
  audioId: string;
  onNote: () => void;
  shareUrl?: string;
  shareTitle?: string;
}

export function QuickActions({ audioId, onNote, shareUrl, shareTitle }: QuickActionsProps) {
  const { bookmarked, toggleBookmark } = useBookmark(audioId);
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    };
  }, []);

  const handleShare = async () => {
    const url = shareUrl
      ? new URL(shareUrl, window.location.origin).toString()
      : window.location.href;
    const title = shareTitle ?? document.title;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // user batal — abaikan
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard tidak tersedia — abaikan
    }
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <QuickActionButton
        aria-label={bookmarked ? "Hapus bookmark" : "Bookmark"}
        onClick={() => void toggleBookmark()}
        active={bookmarked}
      >
        {bookmarked ? (
          <BookmarkCheck className="h-5 w-5 fill-current" />
        ) : (
          <Bookmark className="h-5 w-5" />
        )}
      </QuickActionButton>

      <QuickActionButton aria-label="Catatan" onClick={onNote}>
        <StickyNote className="h-5 w-5" />
      </QuickActionButton>

      <QuickActionButton
        aria-label={copied ? "Tersalin" : "Bagikan"}
        onClick={() => void handleShare()}
      >
        {copied ? (
          <Check className="h-5 w-5 text-success" />
        ) : (
          <Share2 className="h-5 w-5" />
        )}
      </QuickActionButton>
    </div>
  );
}

interface QuickActionButtonProps {
  "aria-label": string;
  onClick?: () => void;
  active?: boolean;
  children: React.ReactNode;
}

function QuickActionButton({ "aria-label": ariaLabel, onClick, active, children }: QuickActionButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={cn(
        "btn-player flex min-h-11 flex-col items-center justify-center gap-1 rounded-xl px-4 py-2 text-muted hover:bg-border/30 hover:text-foreground",
        active && "text-brand",
      )}
    >
      {children}
      <span className="text-[10px] font-medium">{ariaLabel}</span>
    </button>
  );
}
