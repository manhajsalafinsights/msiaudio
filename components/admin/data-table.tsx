"use client";

import { useCallback, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

interface DataTableToolbarProps {
  placeholder?: string;
  filterOptions?: { label: string; value: string }[];
  filterLabel?: string;
  filterValue?: string;
  children?: React.ReactNode;
}

export function DataTableToolbar({
  placeholder = "Cari...",
  filterOptions,
  filterLabel,
  filterValue,
  children,
}: DataTableToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const q = searchParams.get("q") ?? "";

  const applyParams = useCallback(
    (next: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(next)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      params.delete("page");
      const qs = params.toString();
      startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname));
    },
    [pathname, router, searchParams],
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <form
        role="search"
        className="relative"
        onSubmit={(e) => {
          e.preventDefault();
          const value = new FormData(e.currentTarget).get("q") as string;
          applyParams({ q: value.trim() });
        }}
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input
          name="q"
          defaultValue={q}
          placeholder={placeholder}
          className="w-64 pl-9 pr-8"
        />
        {q && (
          <button
            type="button"
            aria-label="Hapus pencarian"
            onClick={() => applyParams({ q: "" })}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {filterOptions && (
        <Select
          aria-label={filterLabel ?? "Filter"}
          value={filterValue ?? ""}
          onChange={(e) => applyParams({ status: e.target.value })}
          className="w-44"
        >
          <option value="">{filterLabel ?? "Semua"}</option>
          {filterOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      )}

      {children}
    </div>
  );
}
