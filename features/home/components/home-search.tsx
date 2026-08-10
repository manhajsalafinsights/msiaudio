"use client";

import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";

/** Search utama beranda — navigasi langsung ke /search. */
export function HomeSearch() {
  const router = useRouter();

  return (
    <form
      role="search"
      aria-label="Cari kajian"
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const q = String(form.get("q") ?? "").trim();
        router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
      }}
      className="flex w-full max-w-xl flex-col gap-2 sm:flex-row"
    >
      <label className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <input
          type="search"
          name="q"
          placeholder="Cari series, kitab, ustadz..."
          autoComplete="off"
          className="input h-12 pl-11"
        />
      </label>
      <button type="submit" className="btn btn-primary btn-lg shrink-0">
        Cari
        <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </form>
  );
}
