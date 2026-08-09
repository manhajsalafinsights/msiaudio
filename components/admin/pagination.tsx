"use client";

import { useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { Select } from "@/components/ui/select";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  perPage?: number;
}

function buildHref(pathname: string, params: URLSearchParams, page: number) {
  const next = new URLSearchParams(params);
  next.set("page", String(page));
  const qs = next.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

function getPageItems(page: number, totalPages: number): (number | "ellipsis-left" | "ellipsis-right")[] {
  const start = Math.max(1, page - 1);
  const end = Math.min(totalPages, page + 1);
  const items: (number | "ellipsis-left" | "ellipsis-right")[] = [];
  if (start > 1) {
    items.push(1);
    if (start > 2) items.push("ellipsis-left");
  }
  for (let i = start; i <= end; i++) items.push(i);
  if (end < totalPages) {
    if (end < totalPages - 1) items.push("ellipsis-right");
    items.push(totalPages);
  }
  return items;
}

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

export function Pagination({ page, totalPages, total, perPage }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();

  if (totalPages <= 1) return null;

  const pageItems = getPageItems(page, totalPages);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-3 py-3">
      <div className="flex items-center gap-3">
        <p className="text-xs text-muted">
          {total} data · halaman {page} dari {totalPages}
        </p>
        {perPage && (
          <label className="flex items-center gap-2 text-xs text-muted">
            <span>Tampilkan</span>
            <Select
              value={String(perPage)}
              onChange={(e) => {
                const next = new URLSearchParams(searchParams.toString());
                next.set("perPage", e.target.value);
                next.delete("page");
                const qs = next.toString();
                startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname));
              }}
              className="h-7 w-auto min-w-16 px-2 py-0 pr-7 text-xs"
            >
              {PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Select>
          </label>
        )}
      </div>
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
        {pageItems.map((p, i) =>
          typeof p === "number" ? (
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
          ) : (
            <span key={p + i} className="px-1 text-xs text-muted" aria-hidden>
              &hellip;
            </span>
          ),
        )}
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
