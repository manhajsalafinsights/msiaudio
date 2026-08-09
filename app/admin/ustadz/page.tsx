import Link from "next/link";
import { Plus } from "lucide-react";
import { listSpeakersAdmin } from "@/repositories/speaker-repository";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { UstadzTable } from "@/features/admin/ustadz/components/ustadz-table";

export const metadata = { title: "Ustadz (Admin)" };
export const revalidate = 0;

export default async function AdminUstadzPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const status = params.status === "ACTIVE" || params.status === "INACTIVE" ? params.status : "ALL";

  const { items, total, totalPages } = await listSpeakersAdmin({
    q: params.q,
    page,
    perPage: 10,
    status,
  });

  const rows = items.map((s) => ({
    id: s.id,
    nama: s.nama,
    slug: s.slug,
    foto: s.foto,
    bio: s.bio,
    status: s.status,
    updatedAt: s.updatedAt.toISOString(),
    _count: { series: s._count.series },
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Ustadz"
        description="Kelola pemateri kajian"
        action={
          <Button asChild>
            <Link href="/admin/ustadz/new">
              <Plus className="h-4 w-4" />
              Tambah Ustadz
            </Link>
          </Button>
        }
      />

      <UstadzTable
        rows={rows}
        total={total}
        totalPages={totalPages}
        page={page}
        statusFilter={status === "ALL" ? "" : status}
      />
    </div>
  );
}
