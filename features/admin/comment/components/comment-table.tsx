"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTableToolbar } from "@/components/admin/data-table";
import { Pagination } from "@/components/admin/pagination";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useRowSelection } from "@/components/admin/use-row-selection";
import { useAdminAction } from "@/features/admin/lib/use-admin-action";
import { deleteComment, bulkDeleteComments } from "@/features/admin/comment/actions";
import { formatDistanceToNow } from "@/utils/date";
import type { CommentAdminRow } from "@/repositories/comment-repository";

interface CommentTableProps {
  rows: CommentAdminRow[];
  total: number;
  totalPages: number;
  page: number;
  targetFilter: string;
}

export function CommentTable({ rows, total, totalPages, page, targetFilter }: CommentTableProps) {
  const router = useRouter();
  const { pending, error, run } = useAdminAction(() => router.refresh());
  const [deleteTarget, setDeleteTarget] = useState<CommentAdminRow | null>(null);
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
            placeholder="Cari nama / isi komentar..."
            filters={[
              {
                paramKey: "targetType",
                label: "Semua target",
                value: targetFilter,
                options: [
                  { label: "Kitab", value: "KITAB" },
                  { label: "Series", value: "SERIES" },
                ],
              },
            ]}
          />
          {selected.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted">{selected.length} dipilih</span>
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
              <TableHead>Nama</TableHead>
              <TableHead>Komentar</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Waktu</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted">
                  Tidak ada komentar
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      aria-label={`Pilih komentar ${row.nama}`}
                      checked={selected.includes(row.id)}
                      onChange={() => toggleRow(row.id)}
                      className="h-4 w-4 accent-[var(--brand)]"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-semibold text-brand">
                        {row.nama.charAt(0).toUpperCase()}
                      </span>
                      <span className="truncate font-medium">{row.nama}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="line-clamp-2 text-sm text-foreground/80">{row.content}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant={row.targetType === "KITAB" ? "secondary" : "outline"}>
                        {row.targetType === "KITAB" ? "Kitab" : "Series"}
                      </Badge>
                      {row.targetSlug ? (
                        <Link
                          href={`/${row.targetType === "KITAB" ? "kitab" : "series"}/${row.targetSlug}`}
                          className="line-clamp-1 text-xs text-brand hover:underline"
                        >
                          {row.targetLabel}
                        </Link>
                      ) : (
                        <span className="line-clamp-1 text-xs text-muted">{row.targetLabel}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted">
                    {formatDistanceToNow(new Date(row.createdAt))}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Hapus komentar"
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

        <Pagination page={page} totalPages={totalPages} total={total} />
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus komentar?"
        description={deleteTarget ? `Komentar dari "${deleteTarget.nama}" akan dihapus permanen.` : ""}
        pending={pending}
        onConfirm={() =>
          deleteTarget &&
          run(
            () => deleteComment(deleteTarget.id),
            () => setDeleteTarget(null),
          )
        }
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title="Hapus komentar terpilih?"
        description={`${selected.length} komentar akan dihapus permanen.`}
        pending={pending}
        onConfirm={() =>
          run(
            () => bulkDeleteComments(selected),
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