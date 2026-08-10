import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Captions } from "lucide-react";
import { getAudioAdmin } from "@/repositories/audio-repository";
import { listAllSeries } from "@/repositories/series-repository";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { AudioForm } from "@/features/admin/audio/components/audio-form";

export const metadata = { title: "Edit Audio (Admin)" };
export const revalidate = 0;

function safeBackHref(back?: string): string | undefined {
  return back?.startsWith("/admin/audio") ? back : undefined;
}

export default async function AdminAudioEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ back?: string }>;
}) {
  const { id } = await params;
  const { back } = await searchParams;
  const [audio, seriesOptions] = await Promise.all([getAudioAdmin(id), listAllSeries()]);
  if (!audio) notFound();

  const media = audio.mediaSources[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link
          href={safeBackHref(back) ?? "/admin/audio"}
          className="rounded-md p-1 text-muted hover:text-foreground"
          aria-label="Kembali"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader title={`Edit: ${audio.judul}`} description="Perbarui data audio" />
        <Button asChild variant="outline">
          <Link href={`/admin/audio/${id}/transcript`}>
            <Captions className="h-4 w-4" aria-hidden />
            Transkrip
          </Link>
        </Button>
      </div>

      <AudioForm
        audioId={audio.id}
        seriesOptions={seriesOptions}
        backHref={safeBackHref(back)}
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
