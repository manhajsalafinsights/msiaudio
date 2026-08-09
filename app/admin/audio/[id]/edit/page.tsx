import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAudioAdmin } from "@/repositories/audio-repository";
import { listAllSeries } from "@/repositories/series-repository";
import { PageHeader } from "@/components/admin/page-header";
import { AudioForm } from "@/features/admin/audio/components/audio-form";

export const metadata = { title: "Edit Audio (Admin)" };
export const revalidate = 0;

export default async function AdminAudioEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [audio, seriesOptions] = await Promise.all([getAudioAdmin(id), listAllSeries()]);
  if (!audio) notFound();

  const media = audio.mediaSources[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/audio" className="rounded-md p-1 text-muted hover:text-foreground" aria-label="Kembali">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader title={`Edit: ${audio.judul}`} description="Perbarui data audio" />
      </div>

      <AudioForm
        audioId={audio.id}
        seriesOptions={seriesOptions}
        defaultValues={{
          judul: audio.judul,
          slug: audio.slug,
          seriesId: audio.seriesId,
          nomorSesi: audio.nomorSesi,
          deskripsi: audio.deskripsi ?? "",
          durasi: audio.durasi,
          cover: audio.cover ?? "",
          published: audio.published,
          youtubeUrl: media?.provider === "YOUTUBE" ? (media.url ?? "") : "",
        }}
      />
    </div>
  );
}
