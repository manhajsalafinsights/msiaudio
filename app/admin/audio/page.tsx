import Link from "next/link";
import { Plus } from "lucide-react";
import { listAudioAdmin } from "@/repositories/audio-repository";
import { listAllSeries } from "@/repositories/series-repository";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { AudioTable } from "@/features/admin/audio/components/audio-table";

export const metadata = { title: "Audio (Admin)" };
export const revalidate = 0;

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

export default async function AdminAudioPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string; seriesId?: string; perPage?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const perPage = PER_PAGE_OPTIONS.includes(Number(params.perPage)) ? Number(params.perPage) : 10;
  const status =
    params.status === "PUBLISHED" || params.status === "DRAFT" ? params.status : "ALL";
  const seriesId = params.seriesId ?? "";

  const [seriesOptions, { items, total, totalPages }] = await Promise.all([
    listAllSeries(),
    listAudioAdmin({ q: params.q, page, perPage, status, seriesId }),
  ]);

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
        seriesFilter={seriesId}
        seriesOptions={seriesOptions}
        perPage={perPage}
      />
    </div>
  );
}
