"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Eye, EyeOff, Video, Rocket } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableToolbar } from "@/components/admin/data-table";
import { Pagination } from "@/components/admin/pagination";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useRowSelection } from "@/components/admin/use-row-selection";
import { useAdminAction } from "@/features/admin/lib/use-admin-action";
import { formatDurationHuman } from "@/utils/duration";
import {
  setAudioStatus,
  deleteAudio,
  bulkAudioStatus,
  bulkDeleteAudio,
  publishAllDrafts,
} from "@/features/admin/audio/actions";

interface AudioRow {
  id: string;
  judul: string;
  slug: string;
  cover: string | null;
  nomorSesi: number;
  durasi: number;
  published: boolean;
  series: { judul: string } | null;
  mediaSources: { id: string; provider: string; url: string }[];
}

interface AudioTableProps {
  rows: AudioRow[];
  total: number;
  totalPages: number;
  page: number;
  statusFilter: string;
  seriesFilter: string;
  seriesOptions: { id: string; judul: string }[];
  perPage: number;
  sortFilter: string;
  backHref: string;
  draftCount: number;
}

export function AudioTable({
  rows,
  total,
  totalPages,
  page,
  statusFilter,
  seriesFilter,
  seriesOptions,
  perPage,
  sortFilter,
  backHref,
  draftCount,
}: AudioTableProps) {
  const router = useRouter();
  const { pending, error, run } = useAdminAction(() => router.refresh());
  const [deleteTarget, setDeleteTarget] = useState<AudioRow | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const { selected, toggleRow, toggleAll, clear, allSelected } = useRowSelection(rows);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border bg-surface">
        {error && (
          <div
            role="alert"
            className="border-b border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
          >
            {error}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-3">
          <DataTableToolbar
            placeholder="Cari audio..."
            filters={[
              {
                paramKey: "status",
                label: "Semua status",
                value: statusFilter,
                options: [
                  { label: "Published", value: "PUBLISHED" },
                  { label: "Draft", value: "DRAFT" },
                ],
              },
              {
                paramKey: "seriesId",
                label: "Semua series",
                value: seriesFilter,
                options: seriesOptions.map((s) => ({ label: s.judul, value: s.id })),
              },
              {
                paramKey: "sort",
                label: "Sesi ↑",
                value: sortFilter,
                options: [
                  { label: "Sesi ↑", value: "sesi-asc" },
                  { label: "Sesi ↓", value: "sesi-desc" },
                  { label: "Terbaru", value: "terbaru" },
                ],
              },
            ]}
          />

          {draftCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => run(() => publishAllDrafts(seriesFilter || undefined))}
            >
              <Rocket className="h-4 w-4" />
              Publish Semua Draft ({draftCount})
            </Button>
          )}

          {selected.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted">{selected.length} dipilih</span>
              <Button
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() => run(() => bulkAudioStatus(selected, true), clear)}
              >
                Publish
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() => run(() => bulkAudioStatus(selected, false), clear)}
              >
                Draft
              </Button>
              <Button
                size="sm"
                variant="danger"
                disabled={pending}
                onClick={() => setBulkDeleteOpen(true)}
              >
                Hapus
              </Button>
            </div>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  aria-label="Pilih semua"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="h-4 w-4 accent-[var(--brand)]"
                />
              </TableHead>
              <TableHead>Judul</TableHead>
              <TableHead>Series</TableHead>
              <TableHead>Sesi</TableHead>
              <TableHead>Durasi</TableHead>
              <TableHead>Media</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-muted">
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      aria-label={`Pilih ${row.judul}`}
                      checked={selected.includes(row.id)}
                      onChange={() => toggleRow(row.id)}
                      className="h-4 w-4 accent-[var(--brand)]"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {row.cover ? (
                        <Image
                          src={row.cover}
                          alt=""
                          width={36}
                          height={36}
                          className="h-9 w-9 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-xs font-bold text-brand">
                          {row.judul.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="max-w-56 truncate font-medium">{row.judul}</p>
                        <p className="truncate text-xs text-muted">{row.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-48 truncate text-muted">
                    {row.series?.judul ?? "-"}
                  </TableCell>
                  <TableCell className="text-muted">{row.nomorSesi}</TableCell>
                  <TableCell className="text-muted">{formatDurationHuman(row.durasi)}</TableCell>
                  <TableCell>
                    {row.mediaSources.length > 0 ? (
                      <Badge variant="secondary">
                        <Video className="h-3 w-3" />
                        {row.mediaSources[0].provider === "YOUTUBE"
                          ? "YouTube"
                          : row.mediaSources[0].provider}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={row.published ? "success" : "warning"}>
                      {row.published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Ubah status"
                        disabled={pending}
                        onClick={() => run(() => setAudioStatus(row.id, !row.published))}
                      >
                        {row.published ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button size="icon" variant="ghost" asChild aria-label="Edit">
                        <Link
                          href={`/admin/audio/${row.id}/edit?back=${encodeURIComponent(backHref)}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Hapus"
                        onClick={() => setDeleteTarget(row)}
                      >
                        <Trash2 className="h-4 w-4 text-danger" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Pagination page={page} totalPages={totalPages} total={total} perPage={perPage} />
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus audio?"
        description={`"${deleteTarget?.judul}" akan dihapus permanen.`}
        pending={pending}
        onConfirm={() =>
          deleteTarget &&
          run(
            () => deleteAudio(deleteTarget.id),
            () => setDeleteTarget(null),
          )
        }
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title="Hapus data terpilih?"
        description={`${selected.length} audio akan dihapus permanen.`}
        pending={pending}
        onConfirm={() =>
          run(
            () => bulkDeleteAudio(selected),
            () => {
              clear();
              setBulkDeleteOpen(false);
            },
          )
        }
      />
    </div>
  );
}
