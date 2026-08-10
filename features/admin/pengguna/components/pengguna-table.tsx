"use client";

import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { DataTableToolbar } from "@/components/admin/data-table";
import { Pagination } from "@/components/admin/pagination";
import { useAdminAction } from "@/features/admin/lib/use-admin-action";
import { setUserRole, setUserStatus } from "@/features/admin/pengguna/actions";
import type { Role, UserStatus } from "@prisma/client";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  lastLoginAt: string | null;
  createdAt: string;
}

interface PenggunaTableProps {
  rows: UserRow[];
  total: number;
  totalPages: number;
  page: number;
  isSuperAdmin: boolean;
}

const roleBadge: Record<Role, "brand" | "secondary" | "danger"> = {
  USER: "secondary",
  ADMIN: "brand",
  SUPER_ADMIN: "danger",
};

const roleLabel: Record<Role, string> = {
  USER: "User",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super Admin",
};

const statusBadge: Record<UserStatus, "success" | "warning" | "danger"> = {
  ACTIVE: "success",
  INACTIVE: "warning",
  SUSPENDED: "danger",
};

const statusLabel: Record<UserStatus, string> = {
  ACTIVE: "Aktif",
  INACTIVE: "Nonaktif",
  SUSPENDED: "Diblokir",
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function PenggunaTable({ rows, total, totalPages, page, isSuperAdmin }: PenggunaTableProps) {
  const router = useRouter();
  const { pending, error, run } = useAdminAction(() => router.refresh());

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border bg-surface">
        {error && (
          <div role="alert" className="border-b border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-3">
          <DataTableToolbar placeholder="Cari nama atau email..." />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Peran</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Terakhir Login</TableHead>
              <TableHead>Bergabung</TableHead>
              <TableHead className="text-right">Ubah</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted">
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                        {row.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 truncate font-medium">
                          {row.name}
                          {row.role !== "USER" && <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-brand" aria-hidden />}
                        </p>
                        <p className="truncate text-xs text-muted">{row.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleBadge[row.role]}>{roleLabel[row.role]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadge[row.status]}>{statusLabel[row.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-muted">{formatDate(row.lastLoginAt)}</TableCell>
                  <TableCell className="text-muted">{formatDate(row.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Select
                        aria-label="Ubah peran"
                        value={row.role}
                        disabled={pending || !isSuperAdmin}
                        title={isSuperAdmin ? "Ubah peran" : "Hanya Super Admin"}
                        onChange={(e) =>
                          run(() => setUserRole(row.id, e.target.value as Role))
                        }
                        className="h-8 w-auto min-w-28 px-2 py-0 pr-7 text-xs"
                      >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                      </Select>
                      <Select
                        aria-label="Ubah status"
                        value={row.status}
                        disabled={pending}
                        onChange={(e) =>
                          run(() => setUserStatus(row.id, e.target.value as UserStatus))
                        }
                        className="h-8 w-auto min-w-28 px-2 py-0 pr-7 text-xs"
                      >
                        <option value="ACTIVE">Aktif</option>
                        <option value="INACTIVE">Nonaktif</option>
                        <option value="SUSPENDED">Diblokir</option>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Pagination page={page} totalPages={totalPages} total={total} perPage={10} />
      </div>
    </div>
  );
}
