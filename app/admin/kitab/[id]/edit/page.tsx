import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSeriesTypeById } from "@/repositories/series-type-repository";
import { PageHeader } from "@/components/admin/page-header";
import { KitabForm } from "@/features/admin/kitab/components/kitab-form";

export const metadata = { title: "Edit Kitab (Admin)" };
export const revalidate = 0;

export default async function AdminKitabEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const kitab = await getSeriesTypeById(id);
  if (!kitab) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/kitab"
          className="rounded-md p-1 text-muted hover:text-foreground"
          aria-label="Kembali"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader title={`Edit: ${kitab.nama}`} description="Perbarui data kitab" />
      </div>

      <KitabForm
        kitabId={kitab.id}
        defaultValues={{
          nama: kitab.nama,
          slug: kitab.slug,
          icon: kitab.icon ?? "",
          description: kitab.description ?? "",
          isKitab: kitab.isKitab,
        }}
      />
    </div>
  );
}
