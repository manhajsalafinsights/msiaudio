import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { TagForm } from "@/features/admin/tag/components/tag-form";

export const metadata = { title: "Tambah Tag (Admin)" };

export default async function AdminTagNewPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/tag" className="rounded-md p-1 text-muted hover:text-foreground" aria-label="Kembali">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader title="Tambah Tag" description="Buat tag konten baru" />
      </div>

      <TagForm />
    </div>
  );
}
