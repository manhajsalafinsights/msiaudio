"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

type TrackViewLinkProps = ComponentProps<typeof Link> & {
  kind: "series" | "kitab" | "audio";
  slug: string;
};

export function TrackViewLink({ kind, slug, onClick, ...rest }: TrackViewLinkProps) {
  return (
    <Link
      {...rest}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        void fetch("/api/track-view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind, slug }),
          keepalive: true,
        }).catch(() => {});
      }}
    />
  );
}
