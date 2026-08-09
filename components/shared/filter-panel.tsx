"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, RotateCcw, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FilterSelect } from "@/components/shared/filter-select";

type Option = { id: string; nama: string; slug: string };

type FilterPanelProps = {
  categories: Option[];
  seriesTypes: Option[];
  speakers: Option[];
  tags: Option[];
  currentCategory?: string;
  currentSeriesType?: string;
  currentSpeaker?: string;
  currentTag?: string;
  currentSort?: string;
  currentSearch?: string;
  /** Base path tujuan update URL (default /explore). */
  baseHref?: string;
};

const SERIES_SORTS = [
  { value: "terbaru", label: "Terbaru" },
  { value: "terlama", label: "Terlama" },
  { value: "az", label: "Judul (A–Z)" },
  { value: "za", label: "Judul (Z–A)" },
  { value: "durasi_asc", label: "Durasi Terpendek" },
  { value: "durasi_desc", label: "Durasi Terpanjang" },
  { value: "terbanyak_audio", label: "Paling Banyak Sesi" },
];

export function FilterPanel({
  categories,
  seriesTypes,
  speakers,
  tags,
  currentCategory = "",
  currentSeriesType = "",
  currentSpeaker = "",
  currentTag = "",
  currentSort = "terbaru",
  currentSearch = "",
  baseHref = "/explore",
}: FilterPanelProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(currentSearch);
  const [sheetOpen, setSheetOpen] = useState(false);

  const buildQuery = (changes: Record<string, string | null | undefined>) => {
    const seen = new Set<string>();
    const parts: string[] = [];
    for (const [key, value] of searchParams.entries()) {
      seen.add(key);
      if (changes[key] !== undefined) {
        if (changes[key]) parts.push(`${key}=${encodeURIComponent(changes[key]!)}`);
      } else {
        parts.push(`${key}=${encodeURIComponent(value)}`);
      }
    }
    for (const [key, value] of Object.entries(changes)) {
      if (value && !seen.has(key)) parts.push(`${key}=${encodeURIComponent(value)}`);
    }
    parts.push("page=1");
    return `${baseHref}?${parts.join("&")}`;
  };

  const updateParam = (key: string, value: string) => {
    router.replace(buildQuery({ [key]: value }));
  };

  const resetFilters = () => {
    router.replace(buildQuery({ kategori: null, type: null, ustadz: null, tag: null, sort: null }));
    setSheetOpen(false);
  };

  const clearAll = () => {
    router.replace(buildQuery({ kategori: null, type: null, ustadz: null, tag: null, sort: null, q: null }));
    setSearchValue("");
    setSheetOpen(false);
  };

  // Debounce input pencarian (400ms) — tidak request per karakter.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== currentSearch) {
        updateParam("q", searchValue);
      }
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  const activeCount = [
    currentCategory,
    currentSeriesType,
    currentSpeaker,
    currentTag,
    currentSort !== "terbaru" ? currentSort : "",
  ].filter(Boolean).length;

  const selects = (stacked: boolean) => (
    <div className={stacked ? "flex flex-col gap-3" : "flex flex-wrap items-center gap-3"}>
      <FilterSelect
        label={stacked ? "Kategori" : undefined}
        name="kategori"
        value={currentCategory}
        onChange={(v) => updateParam("kategori", v)}
        options={[{ value: "", label: "Semua Kategori" }, ...categories.map((c) => ({ value: c.id, label: c.nama }))]}
      />
      <FilterSelect
        label={stacked ? "Kitab" : undefined}
        name="type"
        value={currentSeriesType}
        onChange={(v) => updateParam("type", v)}
        options={[{ value: "", label: "Semua Kitab" }, ...seriesTypes.map((t) => ({ value: t.id, label: t.nama }))]}
      />
      <FilterSelect
        label={stacked ? "Ustadz / Pemateri" : undefined}
        name="ustadz"
        value={currentSpeaker}
        onChange={(v) => updateParam("ustadz", v)}
        options={[{ value: "", label: "Semua Ustadz" }, ...speakers.map((s) => ({ value: s.id, label: s.nama }))]}
      />
      <FilterSelect
        label={stacked ? "Tag" : undefined}
        name="tag"
        value={currentTag}
        onChange={(v) => updateParam("tag", v)}
        options={[{ value: "", label: "Semua Tag" }, ...tags.map((t) => ({ value: t.id, label: t.nama }))]}
      />
      <FilterSelect
        label={stacked ? "Urutan" : undefined}
        name="sort"
        value={currentSort}
        onChange={(v) => updateParam("sort", v)}
        options={SERIES_SORTS}
      />
      <div className={stacked ? "mt-1 flex flex-col gap-2" : "flex items-center gap-2"}>
        <Button type="button" variant="outline" size="sm" onClick={resetFilters}>
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Filter
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={clearAll}>
          <X className="h-3.5 w-3.5" />
          Hapus Semua
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
          <Input
            type="search"
            name="q"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Cari series..."
            className="pl-10"
          />
        </div>

        {/* Mobile: tombol Filter membuka sheet */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="md:hidden">
              <SlidersHorizontal className="h-4 w-4" />
              Filter
              {activeCount > 0 && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">
                  {activeCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Series</SheetTitle>
            </SheetHeader>
            {selects(true)}
          </SheetContent>
        </Sheet>

        {/* Desktop: filter inline */}
        <div className="hidden md:block">{selects(false)}</div>
      </div>
    </div>
  );
}
