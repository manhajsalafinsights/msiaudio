import Link from "next/link";
import { Plus } from "lucide-react";
import { listAudioAdmin } from "@/repositories/audio-repository";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { AudioTable } from "@/features/admin/audio/components/audio-table";

export const metadata = { title: "Audio (Admin)" };
export const revalidate = 0;

export default async function AdminAudioPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const status =
    params.status === "PUBLISHED" || params.status === "DRAFT" ? params.status : "ALL";

  const { items, total, totalPages } = await listAudioAdmin({
    q: params.q,
    page,
    perPage: 10,
    status,
  });

  const rows = items.map((a) => ({
    id: a.id,
    judul: a.judul,
    slug: a.slug,
    cover: a.cover,
    nomorSesi: a.nomorSesi,
    durasi: a.durasi,
    published: a.published,
    series: a.series,
    mediaSources: a.mediaSources,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Audio"
        description="Kelola rekaman audio setiap sesi"
        action={
          <Button asChild>
            <Link href="/admin/audio/new">
              <Plus className="h-4 w-4" />
              Tambah Audio
            </Link>
          </Button>
        }
      />

      <AudioTable
        rows={rows}
        total={total}
        totalPages={totalPages}
        page={page}
        statusFilter={status === "ALL" ? "" : status}
      />
    </div>
  );
}
