import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listSeriesTypes } from "@/repositories/series-type-repository";
import { listActiveSpeakers } from "@/repositories/speaker-repository";
import { prisma } from "@/lib/prisma/client";
import { PageHeader } from "@/components/admin/page-header";
import { SeriesForm } from "@/features/admin/series/components/series-form";

export const metadata = { title: "Tambah Series (Admin)" };

export default async function AdminSeriesNewPage() {
  const [kitabOptions, speakerOptions, categoryOptions, tagOptions] = await Promise.all([
    listSeriesTypes(),
    listActiveSpeakers(),
    prisma.category.findMany({ select: { id: true, nama: true }, orderBy: { nama: "asc" } }),
    prisma.tag.findMany({ select: { id: true, nama: true }, orderBy: { nama: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/series" className="rounded-md p-1 text-muted hover:text-foreground" aria-label="Kembali">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader title="Tambah Series" description="Buat kumpulan kajian baru" />
      </div>

      <SeriesForm
        kitabOptions={kitabOptions}
        speakerOptions={speakerOptions}
        categoryOptions={categoryOptions}
        tagOptions={tagOptions}
      />
    </div>
  );
}
