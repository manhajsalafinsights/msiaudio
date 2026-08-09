import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { KitabForm } from "@/features/admin/kitab/components/kitab-form";

export const metadata = { title: "Tambah Kitab (Admin)" };

export default function AdminKitabNewPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/kitab" className="rounded-md p-1 text-muted hover:text-foreground" aria-label="Kembali">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader title="Tambah Kitab" description="Buat kitab / jenis kajian baru" />
      </div>

      <KitabForm />
    </div>
  );
}
