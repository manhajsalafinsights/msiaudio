"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  Check,
  AlertCircle,
  ListPlus,
  RotateCcw,
  Wand2,
  Eye,
  Radio,
  ExternalLink,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/utils/cn";
import {
  previewChannel,
  importSingleChannelPlaylist,
  type ChannelPreview,
  type ChannelPlaylistResult,
} from "@/features/admin/playlist/channel-actions";

type SeriesTypeOption = { id: string; nama: string; slug: string };

export function ChannelImport({ seriesTypes }: { seriesTypes: SeriesTypeOption[] }) {
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState<ChannelPreview | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [seriesTypeId, setSeriesTypeId] = useState("");
  const [published, setPublished] = useState(false);
  const [cleanTitles, setCleanTitles] = useState(true);
  const [results, setResults] = useState<ChannelPlaylistResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [importing, startImport] = useTransition();
  const [importingTitle, setImportingTitle] = useState<string | null>(null);

  const loadChannel = () => {
    setError(null);
    setResults(null);
    setPreview(null);
    setSelected(new Set());
    startTransition(async () => {
      const res = await previewChannel(url);
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      setPreview(res.data);
    });
  };

  const toggle = (playlistId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(playlistId)) {
        next.delete(playlistId);
      } else {
        next.add(playlistId);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (!preview) return;
    setSelected(new Set(preview.playlists.map((p) => p.id)));
  };

  const selectNone = () => setSelected(new Set());

  const handleImport = () => {
    if (!preview) return;
    setError(null);
    setResults(null);
    const targets = preview.playlists.filter((p) => selected.has(p.id));
    startImport(async () => {
      const acc: ChannelPlaylistResult[] = [];
      for (let i = 0; i < targets.length; i++) {
        const target = targets[i];
        setImportingTitle(`${i + 1}/${targets.length} · ${target.title}`);
        const res = await importSingleChannelPlaylist({
          playlistId: target.id,
          seriesTypeId,
          published,
          cleanTitles,
        });
        if (res.ok) {
          acc.push(res.data);
        } else {
          acc.push({
            playlistId: target.id,
            playlistTitle: target.title,
            ok: false,
            message: res.error.message,
          });
        }
        setResults([...acc]);
      }
      setImportingTitle(null);
    });
  };

  const reset = () => {
    setUrl("");
    setPreview(null);
    setSelected(new Set());
    setResults(null);
    setError(null);
  };

  const selectedPlaylists = preview?.playlists.filter((p) => selected.has(p.id)) ?? [];
  const selectedVideos = selectedPlaylists.reduce((sum, p) => sum + p.itemCount, 0);
  const doneCount = results?.filter((r) => r.ok).length ?? 0;
  const failCount = (results?.length ?? 0) - doneCount;

  return (
    <div className="flex flex-col gap-6">
      <div className="card card-msi flex flex-col gap-4 p-5">
        <label htmlFor="channel-url" className="text-sm font-medium">
          Link atau ID Channel YouTube
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="channel-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadChannel()}
            placeholder="https://www.youtube.com/@handle | /channel/UC... | /user/... | UC..."
            disabled={pending}
          />
          <Button onClick={loadChannel} disabled={pending || !url.trim()}>
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Radio className="h-4 w-4" aria-hidden />
            )}
            Muat Channel
          </Button>
        </div>
        <p className="text-xs text-muted">
          Mengambil SEMUA playlist publik channel (YouTube Data API, butuh YOUTUBE_API_KEY).
          Playlist auto &quot;uploads&quot; dilewati karena berisi seluruh video secara redundan.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
          {error}
        </div>
      )}

      {preview && !results && (
        <>
          <div className="card card-msi flex flex-col gap-5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold">{preview.channelTitle}</h2>
                <p className="mt-0.5 text-xs text-muted">
                  {preview.playlists.length} playlist ditemukan
                  {preview.truncated && (
                    <span className="text-warning"> — daftar lebih besar, hanya sebagian terambil</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={selectAll} disabled={importing}>
                  Pilih Semua
                </Button>
                <Button variant="ghost" size="sm" onClick={selectNone} disabled={importing}>
                  Batal Semua
                </Button>
              </div>
            </div>

            <div className="grid max-h-[420px] gap-1.5 overflow-y-auto pr-1">
              {preview.playlists.map((p) => {
                const active = selected.has(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="checkbox"
                    aria-checked={active}
                    onClick={() => toggle(p.id)}
                    disabled={importing}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors",
                      active ? "border-brand/40 bg-brand/10" : "border-border bg-surface",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
                        active ? "border-brand bg-brand text-white" : "border-border",
                      )}
                    >
                      {active && <Check className="h-3 w-3" aria-hidden />}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{p.title}</span>
                    <span className="shrink-0 text-xs text-muted">
                      {p.itemCount.toLocaleString("id-ID")} video
                    </span>
                    <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted">
                      Playlist
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card card-msi flex flex-col gap-4 p-5">
            <h3 className="text-sm font-bold">Pengaturan Import</h3>

            <div>
              <label htmlFor="channel-series-type" className="mb-1.5 block text-sm font-medium">
                Kitab / Tipe Series (dipakai semua playlist)
              </label>
              <Select
                id="channel-series-type"
                value={seriesTypeId}
                onChange={(e) => setSeriesTypeId(e.target.value)}
                invalid={!seriesTypeId}
              >
                <option value="">Pilih kitab...</option>
                {seriesTypes.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.nama}
                  </option>
                ))}
              </Select>
              <p className="mt-1.5 text-xs text-muted">
                Setiap playlist terpilih dibuatkan series baru dengan judul = judul playlist.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
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

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <p className="flex items-center gap-2 text-sm text-muted">
                <ListPlus className="h-4 w-4" aria-hidden />
                <span>
                  <strong className="text-foreground">{selectedPlaylists.length}</strong> playlist ·{" "}
                  <strong className="text-foreground">{selectedVideos.toLocaleString("id-ID")}</strong>{" "}
                  video (private/deleted & duplikat otomatis dilewati)
                </span>
              </p>
              <Button
                size="lg"
                disabled={importing || selectedPlaylists.length === 0 || !seriesTypeId}
                onClick={handleImport}
              >
                {importing ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <ListPlus className="h-4 w-4" aria-hidden />
                )}
                Import {selectedPlaylists.length} Playlist
              </Button>
            </div>
          </div>
        </>
      )}

      {results && (
        <div className="card card-msi flex flex-col gap-4 p-5">
          {importing && (
            <div className="flex items-center gap-3 rounded-lg border border-brand/30 bg-brand/10 px-4 py-3 text-sm">
              <Loader2 className="h-4 w-4 animate-spin text-brand" aria-hidden />
              <span>
                Mengimpor <strong className="text-foreground">{importingTitle}</strong> — proses
                per playlist, halaman aman ditutup; playlist yang sudah selesai tetap tersimpan.
              </span>
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold">
                {importing ? "Sedang import..." : "Import selesai"}
              </h2>
              <p className="mt-0.5 text-sm text-muted">
                {doneCount} playlist berhasil · {failCount} gagal
                {importing && ` · ${results.length}/${results.length + (preview?.playlists.filter((p) => selected.has(p.id)).length ?? 0) - results.length} selesai`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/admin/series">Lihat Series</Link>
              </Button>
              <Button variant="outline" onClick={reset}>
                <RotateCcw className="h-4 w-4" aria-hidden />
                Import Channel Lain
              </Button>
            </div>
          </div>

          <div className="grid max-h-[420px] gap-1.5 overflow-y-auto pr-1">
            {results.map((r) => (
              <div
                key={r.playlistId}
                className={cn(
                  "flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2 text-sm",
                  r.ok ? "border-border bg-surface" : "border-danger/30 bg-danger/10",
                )}
              >
                {r.ok ? (
                  <Check className="h-4 w-4 shrink-0 text-success" aria-hidden />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0 text-danger" aria-hidden />
                )}
                <span className="min-w-0 flex-1 truncate font-medium">{r.playlistTitle}</span>
                {r.ok ? (
                  <span className="shrink-0 text-xs text-muted">
                    {r.action === "skipped" ? (
                      "sudah diimpor semua — dilewati"
                    ) : r.action === "merged" ? (
                      <>
                        ditambahkan {r.imported?.toLocaleString("id-ID")} audio ke series yang
                        sudah ada
                        {(r.skippedDuplicates ?? 0) > 0 && ` · ${r.skippedDuplicates} duplikat`}
                        {(r.skippedUnavailable ?? 0) > 0 && ` · ${r.skippedUnavailable} private`}
                      </>
                    ) : (
                      <>
                        {r.imported?.toLocaleString("id-ID")} audio
                        {(r.skippedDuplicates ?? 0) > 0 && ` · ${r.skippedDuplicates} duplikat`}
                        {(r.skippedUnavailable ?? 0) > 0 && ` · ${r.skippedUnavailable} private`}
                      </>
                    )}
                  </span>
                ) : (
                  <span className="shrink-0 text-xs text-danger">{r.message}</span>
                )}
                {r.ok && r.seriesId && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/series/${r.seriesId}/edit`}>
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                      Edit
                    </Link>
                  </Button>
                )}
              </div>
            ))}
          </div>

          <p className="text-xs text-muted">
            Video yang sudah dipakai series lain otomatis dilewati (tidak akan diduplikasi).
            Perhatian: import channel satu kali jalan bisa menghabiskan kuota YouTube Data API —
            jalankan bertahap jika channel sangat besar.
          </p>
        </div>
      )}
    </div>
  );
}