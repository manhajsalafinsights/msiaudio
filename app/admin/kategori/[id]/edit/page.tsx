import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCategoryById } from "@/repositories/category-repository";
import { PageHeader } from "@/components/admin/page-header";
import { KategoriForm } from "@/features/admin/kategori/components/kategori-form";

export const metadata = { title: "Edit Kategori (Admin)" };
export const revalidate = 0;

export default async function AdminKategoriEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const kategori = await getCategoryById(id);
  if (!kategori) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/kategori" className="rounded-md p-1 text-muted hover:text-foreground" aria-label="Kembali">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader title={`Edit: ${kategori.nama}`} description="Perbarui data kategori" />
      </div>

      <KategoriForm
        kategoriId={kategori.id}
        defaultValues={{
          nama: kategori.nama,
          slug: kategori.slug,
          icon: kategori.icon ?? "",
        }}
      />
    </div>
  );
}
