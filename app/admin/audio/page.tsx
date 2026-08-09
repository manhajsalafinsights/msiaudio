import Link from "next/link";
import { Plus, ListPlus } from "lucide-react";
import { listAudioAdmin } from "@/repositories/audio-repository";
import { listAllSeries } from "@/repositories/series-repository";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { AudioTable } from "@/features/admin/audio/components/audio-table";

export const metadata = { title: "Audio (Admin)" };
export const revalidate = 0;

const PER_PAGE_OPTIONS = [10, 25, 50, 100];
const SORT_OPTIONS = ["sesi-asc", "sesi-desc", "terbaru"];

export default async function AdminAudioPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    page?: string;
    status?: string;
    seriesId?: string;
    perPage?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const perPage = PER_PAGE_OPTIONS.includes(Number(params.perPage)) ? Number(params.perPage) : 10;
  const status = params.status === "PUBLISHED" || params.status === "DRAFT" ? params.status : "ALL";
  const seriesId = params.seriesId ?? "";
  const sort = SORT_OPTIONS.includes(params.sort ?? "")
    ? (params.sort as "sesi-asc" | "sesi-desc" | "terbaru")
    : "sesi-asc";

  // Kembali ke view yang sama (filter) setelah tambah/edit audio.
  const backEntries: [string, string][] = [];
  if (params.q) backEntries.push(["q", params.q]);
  if (params.status === "PUBLISHED" || params.status === "DRAFT")
    backEntries.push(["status", params.status]);
  if (params.seriesId) backEntries.push(["seriesId", params.seriesId]);
  if (params.sort && SORT_OPTIONS.includes(params.sort)) backEntries.push(["sort", params.sort]);
  if (params.perPage && PER_PAGE_OPTIONS.includes(Number(params.perPage)))
    backEntries.push(["perPage", params.perPage]);
  const backHref = backEntries.length
    ? `/admin/audio?${new URLSearchParams(backEntries).toString()}`
    : "/admin/audio";

  const [seriesOptions, { items, total, totalPages }] = await Promise.all([
    listAllSeries(),
    listAudioAdmin({ q: params.q, page, perPage, status, seriesId, sort }),
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
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/audio/import">
                <ListPlus className="h-4 w-4" />
                Import Playlist
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/admin/audio/new?back=${encodeURIComponent(backHref)}`}>
                <Plus className="h-4 w-4" />
                Tambah Audio
              </Link>
            </Button>
          </div>
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
        sortFilter={sort}
        backHref={backHref}
      />
    </div>
  );
}
