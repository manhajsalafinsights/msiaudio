"use client";

import { useTransition, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ListPlus,
  Loader2,
  Check,
  AlertCircle,
  ExternalLink,
  RotateCcw,
  ListMusic,
  Wand2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatDurationHuman } from "@/utils/duration";
import { cn } from "@/utils/cn";
import {
  previewPlaylist,
  importPlaylistAsSeries,
  type PlaylistPreview,
  type ImportSummary,
} from "@/features/admin/playlist/actions";
import { ChannelImport } from "@/features/admin/playlist/components/channel-import";

type SeriesTypeOption = { id: string; nama: string; slug: string };
type SeriesOption = {
  id: string;
  judul: string;
  seriesType?: { nama: string } | null;
};

export function PlaylistImport({
  seriesTypes,
  seriesOptions,
}: {
  seriesTypes: SeriesTypeOption[];
  seriesOptions: SeriesOption[];
}) {
  const [url, setUrl] = useState("");
  const [view, setView] = useState<"playlist" | "channel">("playlist");
  const [preview, setPreview] = useState<PlaylistPreview | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<"new" | "existing">("new");
  const [seriesTypeId, setSeriesTypeId] = useState("");
  const [targetSeriesId, setTargetSeriesId] = useState("");
  const [published, setPublished] = useState(false);
  const [cleanTitles, setCleanTitles] = useState(true);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [importing, startImport] = useTransition();

  const seriesGroups = seriesOptions.reduce<Record<string, SeriesOption[]>>((acc, s) => {
    const key = s.seriesType?.nama?.trim() ? s.seriesType.nama : "Tanpa Tipe";
    (acc[key] ||= []).push(s);
    return acc;
  }, {});
  const seriesGroupKeys = Object.keys(seriesGroups).sort((a, b) => a.localeCompare(b));

  const loadPlaylist = () => {
    setError(null);
    setSummary(null);
    startTransition(async () => {
      const res = await previewPlaylist(url);
      if (!res.ok) {
        setError(res.error.message);
        setPreview(null);
        return;
      }
      setPreview(res.data);
      setSelected(
        new Set(
          res.data.items
            .filter((i) => !i.duplicate && !i.privateVideo)
            .map((i) => i.videoId),
        ),
      );
    });
  };

  const toggle = (videoId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(videoId)) {
        next.delete(videoId);
      } else {
        next.add(videoId);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (!preview) return;
    setSelected(new Set(preview.items.filter((i) => !i.privateVideo).map((i) => i.videoId)));
  };

  const selectNone = () => setSelected(new Set());

  const handleImport = () => {
    setError(null);
    startImport(async () => {
      const res = await importPlaylistAsSeries({
        playlistUrl: url,
        mode,
        seriesTypeId: mode === "new" && seriesTypeId !== "__auto__" ? seriesTypeId : undefined,
        autoDetectType: mode === "new" && seriesTypeId === "__auto__",
        targetSeriesId: mode === "existing" ? targetSeriesId : undefined,
        published,
        cleanTitles,
        selectedVideoIds: [...selected],
      });
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      setSummary(res.data);
    });
  };

  const reset = () => {
    setUrl("");
    setPreview(null);
    setSelected(new Set());
    setMode("new");
    setSeriesTypeId("");
    setTargetSeriesId("");
    setSummary(null);
    setError(null);
  };

  const selectedCount = preview ? preview.items.filter((i) => selected.has(i.videoId)).length : 0;

  if (summary) {
    return (
      <div className="card card-msi flex flex-col items-center gap-4 p-8 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success">
          <Check className="h-6 w-6" aria-hidden />
        </span>
        <div>
          <h2 className="text-lg font-bold">Import selesai</h2>
          {summary.action === "skipped" ? (
            <p className="mt-1 text-sm text-muted">
              Semua video sudah ada di series{" "}
              <span className="font-medium text-foreground">{summary.seriesTitle}</span> — tidak
              ada yang diimpor.
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted">
              {summary.imported} audio diimpor ke series{" "}
              <span className="font-medium text-foreground">{summary.seriesTitle}</span>
              {summary.action === "merged" && " (series dengan judul yang sama sudah ada, audio ditambahkan ke series tersebut)"}.
            </p>
          )}
        </div>
        {(summary.skippedDuplicates > 0 ||
          summary.skippedUnavailable > 0 ||
          summary.skippedSesiConflict > 0) && (
          <ul className="max-w-md list-inside list-disc text-left text-sm text-muted">
            {summary.skippedDuplicates > 0 && (
              <li>{summary.skippedDuplicates} video dilewati karena sudah dipakai audio lain.</li>
            )}
            {summary.skippedUnavailable > 0 && (
              <li>{summary.skippedUnavailable} video private/deleted dilewati.</li>
            )}
            {summary.skippedSesiConflict > 0 && (
              <li>{summary.skippedSesiConflict} video dilewati karena nomor sesi bertabrakan.</li>
            )}
          </ul>
        )}
        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link href={`/admin/series/${summary.seriesId}/edit`}>Edit Series</Link>
          </Button>
          <Button variant="outline" onClick={reset}>
            <RotateCcw className="h-4 w-4" aria-hidden />
            Import Playlist Lain
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => setView("playlist")}
          className={cn(
            "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
            view === "playlist"
              ? "border-brand bg-brand/10 text-brand"
              : "border-border bg-surface text-muted hover:text-foreground",
          )}
        >
          Import Playlist
        </button>
        <button
          type="button"
          onClick={() => setView("channel")}
          className={cn(
            "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
            view === "channel"
              ? "border-brand bg-brand/10 text-brand"
              : "border-border bg-surface text-muted hover:text-foreground",
          )}
        >
          Import Channel (Semua Playlist)
        </button>
      </div>

      {view === "channel" ? (
        <ChannelImport seriesTypes={seriesTypes} />
      ) : (
        <>
      <div className="card card-msi flex flex-col gap-4 p-5">
        <label htmlFor="playlist-url" className="text-sm font-medium">
          URL atau ID Playlist YouTube
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="playlist-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadPlaylist()}
            placeholder="https://www.youtube.com/playlist?list=PL... atau PL..."
            disabled={pending}
          />
          <Button onClick={loadPlaylist} disabled={pending || !url.trim()}>
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <ListPlus className="h-4 w-4" aria-hidden />
            )}
            Ambil Playlist
          </Button>
        </div>
        <p className="text-xs text-muted">
          Menggunakan YouTube Data API (maks. 5000 video + durasi) bila key tersedia, atau RSS feed
          (maks. 50 video terbaru) bila tidak.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
          {error}
        </div>
      )}

      {preview && (
        <>
          <div className="card card-msi flex flex-col gap-5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold">{preview.playlistTitle}</h2>
                <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span className="rounded bg-brand/10 px-1.5 py-0.5 font-medium text-brand">
                    {preview.source === "data-api" ? "Data API" : "RSS"}
                  </span>
                  {preview.items.length} video ditemukan
                  {preview.truncated && (
                    <span className="text-warning">
                      — playlist lebih besar, hanya sebagian terambil
                    </span>
                  )}
                  {preview.items.some((i) => i.privateVideo) && (
                    <span className="text-warning">— video private/deleted tidak dicentang</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={selectAll}>
                  Semua
                </Button>
                <Button variant="ghost" size="sm" onClick={selectNone}>
                  Batal Semua
                </Button>
              </div>
            </div>

            <div className="grid max-h-[420px] gap-1.5 overflow-y-auto pr-1">
              {preview.items.map((item) => {
                const active = selected.has(item.videoId);
                return (
                  <div
                    key={item.videoId}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors",
                      active ? "border-brand/40 bg-brand/10" : "border-border bg-surface",
                    )}
                  >
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={active}
                      onClick={() => toggle(item.videoId)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <span
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
                          active ? "border-brand bg-brand text-white" : "border-border",
                        )}
                      >
                        {active && <Check className="h-3 w-3" aria-hidden />}
                      </span>
                      <Image
                        src={item.thumbnail}
                        alt=""
                        width={64}
                        height={36}
                        className="aspect-video w-16 shrink-0 rounded object-cover"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs text-muted">Sesi {item.position}</span>
                        <span className="block truncate text-sm font-medium">{item.title}</span>
                      </span>
                    </button>
                    <span className="shrink-0 text-xs text-muted">
                      {item.durationSeconds ? formatDurationHuman(item.durationSeconds) : "–"}
                    </span>
                    {item.duplicate && (
                      <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted">
                        Sudah ada
                      </span>
                    )}
                    {item.privateVideo && (
                      <span className="shrink-0 rounded bg-warning/15 px-1.5 py-0.5 text-[10px] font-medium text-warning">
                        Private
                      </span>
                    )}
                    <Button variant="ghost" size="icon" asChild>
                      <a
                        href={`https://www.youtube.com/watch?v=${item.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Buka video di YouTube"
                      >
                        <ExternalLink className="h-4 w-4" aria-hidden />
                      </a>
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card card-msi flex flex-col gap-4 p-5">
            <h3 className="text-sm font-bold">Pengaturan Import</h3>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Tujuan audio</span>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setMode("new")}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                    mode === "new"
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-border bg-surface text-muted hover:text-foreground",
                  )}
                >
                  Series Baru
                </button>
                <button
                  type="button"
                  onClick={() => setMode("existing")}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                    mode === "existing"
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-border bg-surface text-muted hover:text-foreground",
                  )}
                >
                  Tambah ke Series yang Ada
                </button>
              </div>
              <p className="text-xs text-muted">
                {mode === "new"
                  ? "Buat series baru dari playlist ini (judul series = judul playlist), untuk semua tipe termasuk Tematik."
                  : "Audio ditambahkan ke series pilihan; nomor sesi melanjutkan sesi terakhir series tersebut."}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {mode === "new" ? (
                <div>
                  <label htmlFor="series-type" className="mb-1.5 block text-sm font-medium">
                    Kitab / Tipe Series
                  </label>
                  <Select
                    id="series-type"
                    value={seriesTypeId}
                    onChange={(e) => setSeriesTypeId(e.target.value)}
                    invalid={!seriesTypeId}
                  >
                    <option value="">Pilih kitab...</option>
                    <option value="__auto__">Otomatis — deteksi dari judul (kitab/tematik)</option>
                    {seriesTypes.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.nama}
                      </option>
                    ))}
                  </Select>
                  {seriesTypes.length === 0 && (
                    <p className="mt-1.5 text-xs text-muted">
                      Belum ada kitab. Buat dulu di menu{" "}
                      <Link href="/admin/kitab" className="text-brand hover:underline">
                        Kitab
                      </Link>
                      .
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label htmlFor="target-series" className="mb-1.5 block text-sm font-medium">
                    Series Tujuan
                  </label>
                  <Select
                    id="target-series"
                    value={targetSeriesId}
                    onChange={(e) => setTargetSeriesId(e.target.value)}
                    invalid={!targetSeriesId}
                  >
                    <option value="">Pilih series tujuan...</option>
                    {seriesGroupKeys.map((group) => (
                      <optgroup key={group} label={group}>
                        {seriesGroups[group].map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.judul}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </Select>
                  {seriesOptions.length === 0 && (
                    <p className="mt-1.5 text-xs text-muted">
                      Belum ada series. Buat dulu lewat mode &quot;Series Baru&quot;.
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-end gap-3">
                <Button
                  variant={cleanTitles ? "primary" : "outline"}
                  onClick={() => setCleanTitles((v) => !v)}
                  title="Hapus prefix seperti '01 - ' atau '#13' di awal judul"
                >
                  <Wand2 className="h-4 w-4" aria-hidden />
                  Bersihkan Prefix Nomor
                </Button>
                <Button
                  variant={published ? "primary" : "outline"}
                  onClick={() => setPublished((v) => !v)}
                >
                  <Eye className="h-4 w-4" aria-hidden />
                  Langsung Publish
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <p className="flex items-center gap-2 text-sm text-muted">
                <ListMusic className="h-4 w-4" aria-hidden />
                <span>
                  <strong className="text-foreground">{selectedCount}</strong> video siap diimpor{" "}
                  {mode === "existing" ? "ke series tujuan" : "sebagai series baru"}
                </span>
              </p>
              <Button
                size="lg"
                disabled={
                  importing ||
                  selectedCount === 0 ||
                  (mode === "new" ? !seriesTypeId : !targetSeriesId)
                }
                onClick={handleImport}
              >
                {importing ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <ListPlus className="h-4 w-4" aria-hidden />
                )}
                Import {selectedCount} Audio
              </Button>
            </div>
          </div>
        </>
      )}
        </>
      )}
    </div>
  );
}
