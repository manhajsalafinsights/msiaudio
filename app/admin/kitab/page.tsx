import Link from "next/link";
import { Plus } from "lucide-react";
import { listSeriesTypesAdmin } from "@/repositories/series-type-repository";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { KitabTable } from "@/features/admin/kitab/components/kitab-table";

export const metadata = { title: "Kitab (Admin)" };
export const revalidate = 0;

export default async function AdminKitabPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const { items, total, totalPages } = await listSeriesTypesAdmin({
    q: params.q,
    page,
    perPage: 10,
  });

  const rows = items.map((k) => ({
    id: k.id,
    nama: k.nama,
    slug: k.slug,
    icon: k.icon,
    description: k.description,
    isKitab: k.isKitab,
    _count: { series: k._count.series },
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Kitab"
        description="Kelola kitab / jenis kajian"
        action={
          <Button asChild>
            <Link href="/admin/kitab/new">
              <Plus className="h-4 w-4" />
              Tambah Kitab
            </Link>
          </Button>
        }
      />

      <KitabTable rows={rows} total={total} totalPages={totalPages} page={page} />
    </div>
  );
}
