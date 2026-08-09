import { Settings } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";

export const metadata = { title: "Pengaturan (Admin)" };

export default function AdminPengaturanPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Pengaturan" description="Konfigurasi situs dan media sosial" />

      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface px-6 py-16 text-center">
        <Settings className="h-10 w-10 text-muted" />
        <p className="font-medium">Halaman Pengaturan</p>
        <p className="max-w-md text-sm text-muted">
          Konfigurasi nama situs, tautan media sosial, dan pengaturan umum lainnya. Fitur ini akan
          tersedia pada rilis berikutnya.
        </p>
      </div>
    </div>
  );
}
