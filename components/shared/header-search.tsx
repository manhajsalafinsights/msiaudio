"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

/** Global search — submit langsung navigasi ke halaman /search (tanpa request per karakter). */
export function HeaderSearch() {
  const router = useRouter();

  return (
    <>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          const q = String(form.get("q") ?? "").trim();
          router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
        }}
        className="relative hidden min-w-[180px] md:block"
        aria-label="Cari di seluruh situs"
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
        <Input type="search" name="q" placeholder="Cari series, kitab, ustadz..." className="h-9 pl-10" />
      </form>
      <Link
        href="/search"
        aria-label="Cari"
        className="flex h-9 w-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-border/60 hover:text-foreground md:hidden"
      >
        <Search className="h-4 w-4" aria-hidden />
      </Link>
    </>
  );
}
