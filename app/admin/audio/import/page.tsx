import { listSeriesTypes } from "@/repositories/series-type-repository";
import { PageHeader } from "@/components/admin/page-header";
import { PlaylistImport } from "@/features/admin/playlist/components/playlist-import";

export const metadata = { title: "Import Playlist (Admin)" };
export const revalidate = 0;

export default async function AdminPlaylistImportPage() {
  const seriesTypes = await listSeriesTypes();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Import Playlist YouTube"
        description="Tempel URL playlist, pilih video yang mau diimpor, lalu jadikan satu series baru beserta semua sesinya."
      />
      <PlaylistImport seriesTypes={seriesTypes} />
    </div>
  );
}
