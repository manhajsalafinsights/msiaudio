import { Users } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";

export const metadata = { title: "Pengguna (Admin)" };

export default function AdminPenggunaPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Pengguna" description="Kelola akun pengguna" />

      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface px-6 py-16 text-center">
        <Users className="h-10 w-10 text-muted" />
        <p className="font-medium">Halaman Pengguna</p>
        <p className="max-w-md text-sm text-muted">
          Kelola akun, peran, dan status pengguna. Fitur ini akan tersedia pada rilis berikutnya.
        </p>
      </div>
    </div>
  );
}
