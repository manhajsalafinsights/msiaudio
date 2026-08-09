import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { UstadzForm } from "@/features/admin/ustadz/components/ustadz-form";

export const metadata = { title: "Tambah Ustadz (Admin)" };

export default function AdminUstadzNewPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/ustadz" className="rounded-md p-1 text-muted hover:text-foreground" aria-label="Kembali">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader title="Tambah Ustadz" description="Buat data pemateri baru" />
      </div>

      <UstadzForm />
    </div>
  );
}
