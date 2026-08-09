import Link from "next/link";
import { Plus } from "lucide-react";
import { listSeriesAdmin } from "@/repositories/series-repository";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { SeriesTable } from "@/features/admin/series/components/series-table";

export const metadata = { title: "Series (Admin)" };
export const revalidate = 0;

export default async function AdminSeriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const status =
    params.status === "PUBLISHED" || params.status === "DRAFT" ? params.status : "ALL";

  const { items, total, totalPages } = await listSeriesAdmin({
    q: params.q,
    page,
    perPage: 10,
    status,
  });

  const rows = items.map((s) => ({
    id: s.id,
    judul: s.judul,
    slug: s.slug,
    cover: s.cover,
    published: s.published,
    updatedAt: s.updatedAt.toISOString(),
    seriesType: s.seriesType,
    speakers: s.speakers,
    _count: { audio: s._count.audio },
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Series"
        description="Kelola kumpulan kajian"
        action={
          <Button asChild>
            <Link href="/admin/series/new">
              <Plus className="h-4 w-4" />
              Tambah Series
            </Link>
          </Button>
        }
      />

      <SeriesTable
        rows={rows}
        total={total}
        totalPages={totalPages}
        page={page}
        statusFilter={status === "ALL" ? "" : status}
      />
    </div>
  );
}
