"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Check, Loader2, Search, Wand2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/utils/cn";
import { updateSeriesType } from "@/features/admin/series/actions";

type TypeOption = { id: string; nama: string };
type Row = {
  id: string;
  judul: string;
  currentTypeId: string;
  currentTypeName: string;
  suggestedTypeId: string | null;
};

export function SeriesTypeTidy({ types, rows }: { types: TypeOption[]; rows: Row[] }) {
  const [typeFilter, setTypeFilter] = useState("__all__");
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  const visible = useMemo(() => {
    return rows.filter((r) => {
      if (typeFilter !== "__all__" && r.currentTypeId !== typeFilter) return false;
      if (query.trim() && !r.judul.toLowerCase().includes(query.trim().toLowerCase())) return false;
      return true;
    });
  }, [rows, typeFilter, query]);

  const suggestible = visible.filter((r) => {
    const target = overrides[r.id] ?? r.suggestedTypeId;
    return target && target !== r.currentTypeId;
  });

  const applyOne = (r: Row) => {
    const target = overrides[r.id] ?? r.suggestedTypeId;
    if (!target || target === r.currentTypeId) return;
    setError(null);
    setBusyIds((prev) => new Set(prev).add(r.id));
    startTransition(async () => {
      const res = await updateSeriesType(r.id, target);
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(r.id);
        return next;
      });
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      setDone((prev) => new Set(prev).add(r.id));
    });
  };

  const applyAll = () => {
    setError(null);
    const targets = suggestible.filter((r) => !done.has(r.id));
    if (targets.length === 0) return;
    startTransition(async () => {
      for (const r of targets) {
        const res = await updateSeriesType(r.id, overrides[r.id] ?? r.suggestedTypeId!);
        if (res.ok) {
          setDone((prev) => new Set(prev).add(r.id));
        } else {
          setError(res.error.message);
        }
      }
    });
  };

  const typeById = new Map(types.map((t) => [t.id, t.nama]));

  return (
    <div className="flex flex-col gap-4">
      <div className="card card-msi flex flex-col gap-3 p-5 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="tidy-search" className="mb-1.5 block text-sm font-medium">
            Cari Judul
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
            <Input
              id="tidy-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="misal: kitab, tematik..."
              className="pl-9"
            />
          </div>
        </div>
        <div className="sm:w-64">
          <label htmlFor="tidy-type" className="mb-1.5 block text-sm font-medium">
            Filter Tipe Saat Ini
          </label>
          <Select id="tidy-type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="__all__">Semua tipe</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nama}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <div className="card card-msi flex flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">
            <strong className="text-foreground">{visible.length}</strong> series tampil ·{" "}
            <strong className="text-foreground">{suggestible.length}</strong> siap dipindahkan
          </p>
          <Button
            disabled={pending || suggestible.length === 0 || suggestible.every((r) => done.has(r.id))}
            onClick={applyAll}
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Wand2 className="h-4 w-4" aria-hidden />}
            Terapkan Semua ({suggestible.filter((r) => !done.has(r.id)).length})
          </Button>
        </div>

        <div className="grid max-h-[560px] gap-1.5 overflow-y-auto pr-1">
          {visible.length === 0 && (
            <p className="py-6 text-center text-sm text-muted">Tidak ada series cocok dengan filter.</p>
          )}
          {visible.map((r) => {
            const isDone = done.has(r.id);
            const targetId = overrides[r.id] ?? r.suggestedTypeId;
            const changed = targetId && targetId !== r.currentTypeId;
            const busy = busyIds.has(r.id);
            return (
              <div
                key={r.id}
                className={cn(
                  "flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2 text-sm",
                  isDone ? "border-success/40 bg-success/10" : "border-border bg-surface",
                )}
              >
                {isDone ? (
                  <Check className="h-4 w-4 shrink-0 text-success" aria-hidden />
                ) : (
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full",
                      changed ? "bg-brand" : "bg-muted",
                    )}
                  />
                )}
                <Link
                  href={`/admin/series/${r.id}/edit`}
                  className="min-w-0 flex-1 truncate font-medium hover:text-brand hover:underline"
                  title={r.judul}
                >
                  {r.judul}
                </Link>
                <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted">
                  {r.currentTypeName}
                </span>
                <Select
                  value={targetId ?? "__none__"}
                  disabled={busy}
                  onChange={(e) =>
                    setOverrides((prev) => ({
                      ...prev,
                      [r.id]: e.target.value === "__none__" ? "" : e.target.value,
                    }))
                  }
                  className="w-40"
                  aria-label={`Ganti tipe untuk ${r.judul}`}
                >
                  <option value="__none__">
                    {r.suggestedTypeId ? "Saran: " + (typeById.get(r.suggestedTypeId) ?? "") : "Tanpa saran"}
                  </option>
                  {types
                    .filter((t) => t.id !== r.currentTypeId)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nama}
                      </option>
                    ))}
                </Select>
                <Button
                  size="sm"
                  variant={changed ? "primary" : "outline"}
                  disabled={busy || !changed || isDone}
                  onClick={() => applyOne(r)}
                >
                  {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
                  {isDone ? "Terpasang" : "Terapkan"}
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/admin/series/${r.id}/edit`}>
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    Edit
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}