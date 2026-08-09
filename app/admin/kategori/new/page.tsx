import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { KategoriForm } from "@/features/admin/kategori/components/kategori-form";

export const metadata = { title: "Tambah Kategori (Admin)" };

export default async function AdminKategoriNewPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/kategori" className="rounded-md p-1 text-muted hover:text-foreground" aria-label="Kembali">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader title="Tambah Kategori" description="Buat kategori konten baru" />
      </div>

      <KategoriForm />
    </div>
  );
}
