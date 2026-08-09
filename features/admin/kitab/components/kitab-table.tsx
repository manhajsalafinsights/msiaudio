"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DataTableToolbar } from "@/components/admin/data-table";
import { Pagination } from "@/components/admin/pagination";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useRowSelection } from "@/components/admin/use-row-selection";
import { useAdminAction } from "@/features/admin/lib/use-admin-action";
import { deleteKitab, bulkDeleteKitab } from "@/features/admin/kitab/actions";

interface KitabRow {
  id: string;
  nama: string;
  slug: string;
  icon: string | null;
  description: string | null;
  _count: { series: number };
}

interface KitabTableProps {
  rows: KitabRow[];
  total: number;
  totalPages: number;
  page: number;
}

export function KitabTable({ rows, total, totalPages, page }: KitabTableProps) {
  const router = useRouter();
  const { pending, error, run } = useAdminAction(() => router.refresh());
  const [deleteTarget, setDeleteTarget] = useState<KitabRow | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const { selected, toggleRow, toggleAll, clear, allSelected } = useRowSelection(rows);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border bg-surface">
        {error && (
          <div role="alert" className="border-b border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-3">
          <DataTableToolbar placeholder="Cari kitab..." />
          {selected.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted">{selected.length} dipilih</span>
              <Button size="sm" variant="danger" disabled={pending} onClick={() => setBulkDeleteOpen(true)}>
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
              <TableHead>Nama</TableHead>
              <TableHead>Series</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted">
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      aria-label={`Pilih ${row.nama}`}
                      checked={selected.includes(row.id)}
                      onChange={() => toggleRow(row.id)}
                      className="h-4 w-4 accent-[var(--brand)]"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {row.icon ? (
                        <Image src={row.icon} alt="" width={36} height={36} className="h-9 w-9 rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-xs font-bold text-brand">
                          {row.nama.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium">{row.nama}</p>
                        <p className="truncate text-xs text-muted">{row.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted">{row._count.series}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" asChild aria-label="Edit">
                        <Link href={`/admin/kitab/${row.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button size="icon" variant="ghost" aria-label="Hapus" onClick={() => setDeleteTarget(row)}>
                        <Trash2 className="h-4 w-4 text-danger" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Pagination page={page} totalPages={totalPages} total={total} />
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus kitab?"
        description={`"${deleteTarget?.nama}" akan dihapus permanen.`}
        pending={pending}
        onConfirm={() =>
          deleteTarget && run(() => deleteKitab(deleteTarget.id), () => setDeleteTarget(null))
        }
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title="Hapus data terpilih?"
        description={`${selected.length} kitab akan dihapus permanen.`}
        pending={pending}
        onConfirm={() => run(() => bulkDeleteKitab(selected), () => { clear(); setBulkDeleteOpen(false); })}
      />
    </div>
  );
}
