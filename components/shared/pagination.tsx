"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type PaginationProps = {
  page: number;
  totalPages: number;
  /** Path halaman; query params saat ini dipertahankan, hanya `page` yang diganti. */
  baseHref: string;
};

export function Pagination({ page, totalPages, baseHref }: PaginationProps) {
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const url = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    return `${baseHref}?${params.toString()}`;
  };

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2">
      <Button asChild variant="outline" size="sm" disabled={page <= 1}>
        <Link href={url(page - 1)} aria-label="Halaman sebelumnya">
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Sebelumnya
        </Link>
      </Button>

      <span className="text-sm text-muted" aria-live="polite">
        Halaman {page} dari {totalPages}
      </span>

      <Button asChild variant="outline" size="sm" disabled={page >= totalPages}>
        <Link href={url(page + 1)} aria-label="Halaman berikutnya">
          Berikutnya
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </Button>
    </nav>
  );
}
