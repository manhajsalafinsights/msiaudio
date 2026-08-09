import Link from "next/link";
import { Plus } from "lucide-react";
import { listCategoriesAdmin } from "@/repositories/category-repository";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { KategoriTable } from "@/features/admin/kategori/components/kategori-table";

export const metadata = { title: "Kategori (Admin)" };
export const revalidate = 0;

export default async function AdminKategoriPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const { items, total, totalPages } = await listCategoriesAdmin({
    q: params.q,
    page,
    perPage: 10,
  });

  const rows = items.map((c) => ({
    id: c.id,
    nama: c.nama,
    slug: c.slug,
    icon: c.icon,
    seriesCount: c._count.series,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Kategori"
        description="Kelola kategori konten"
        action={
          <Button asChild>
            <Link href="/admin/kategori/new">
              <Plus className="h-4 w-4" />
              Tambah Kategori
            </Link>
          </Button>
        }
      />

      <KategoriTable rows={rows} total={total} totalPages={totalPages} page={page} />
    </div>
  );
}
