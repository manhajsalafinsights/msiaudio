import Link from "next/link";
import { Plus } from "lucide-react";
import { listTagsAdmin } from "@/repositories/tag-repository";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { TagTable } from "@/features/admin/tag/components/tag-table";

export const metadata = { title: "Tag (Admin)" };
export const revalidate = 0;

export default async function AdminTagPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const { items, total, totalPages } = await listTagsAdmin({
    q: params.q,
    page,
    perPage: 10,
  });

  const rows = items.map((t) => ({
    id: t.id,
    nama: t.nama,
    slug: t.slug,
    seriesCount: t._count.series,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tag"
        description="Kelola tag konten"
        action={
          <Button asChild>
            <Link href="/admin/tag/new">
              <Plus className="h-4 w-4" />
              Tambah Tag
            </Link>
          </Button>
        }
      />

      <TagTable rows={rows} total={total} totalPages={totalPages} page={page} />
    </div>
  );
}
