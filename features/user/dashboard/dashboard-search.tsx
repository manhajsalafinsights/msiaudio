"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

type DashboardSearchProps = {
  baseHref: string;
  defaultValue?: string;
  placeholder?: string;
};

export function DashboardSearch({
  baseHref,
  defaultValue = "",
  placeholder = "Cari...",
}: DashboardSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);

  const buildUrl = (nextSearch: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextSearch) params.set("q", nextSearch);
    else params.delete("q");
    params.set("page", "1");
    return `${baseHref}?${params.toString()}`;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (value !== defaultValue) {
        router.replace(buildUrl(value));
      }
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <form
      role="search"
      className="relative"
      onSubmit={(e) => {
        e.preventDefault();
        router.replace(buildUrl(value));
      }}
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9"
        aria-label="Cari"
      />
      {value && (
        <button
          type="button"
          aria-label="Hapus pencarian"
          onClick={() => {
            setValue("");
            router.replace(buildUrl(""));
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      )}
    </form>
  );
}
