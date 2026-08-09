"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
}

function buildHref(pathname: string, params: URLSearchParams, page: number) {
  const next = new URLSearchParams(params);
  next.set("page", String(page));
  const qs = next.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export function Pagination({ page, totalPages, total }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-3 py-3">
      <p className="text-xs text-muted">
        {total} data · halaman {page} dari {totalPages}
      </p>
      <nav className="flex items-center gap-1" aria-label="Paginasi">
        <Link
          href={page > 1 ? buildHref(pathname, searchParams, page - 1) : "#"}
          aria-disabled={page <= 1}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted",
            page > 1 ? "hover:bg-border/40 hover:text-foreground" : "pointer-events-none opacity-40",
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        {pages.map((p) => (
          <Link
            key={p}
            href={buildHref(pathname, searchParams, p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md border border-border text-sm",
              p === page
                ? "border-brand/30 bg-brand/10 font-medium text-brand"
                : "text-muted hover:bg-border/40 hover:text-foreground",
            )}
          >
            {p}
          </Link>
        ))}
        <Link
          href={page < totalPages ? buildHref(pathname, searchParams, page + 1) : "#"}
          aria-disabled={page >= totalPages}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted",
            page < totalPages ? "hover:bg-border/40 hover:text-foreground" : "pointer-events-none opacity-40",
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </nav>
    </div>
  );
}
