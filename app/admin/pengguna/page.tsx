import { listUsers } from "@/repositories/user-repository";
import { getCurrentUser } from "@/lib/auth/session";
import { PageHeader } from "@/components/admin/page-header";
import { PenggunaTable } from "@/features/admin/pengguna/components/pengguna-table";

export const metadata = { title: "Pengguna (Admin)" };
export const revalidate = 0;

export default async function AdminPenggunaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const [admin, { items, total, totalPages }] = await Promise.all([
    getCurrentUser(),
    listUsers({ q: params.q, page, perPage: 10 }),
  ]);

  const rows = items.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Pengguna" description={`Kelola akun pengguna terdaftar (${total})`} />

      <PenggunaTable
        rows={rows}
        total={total}
        totalPages={totalPages}
        page={page}
        isSuperAdmin={admin?.role === "SUPER_ADMIN"}
      />
    </div>
  );
}
