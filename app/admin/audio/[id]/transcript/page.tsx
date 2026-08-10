import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAudioAdmin } from "@/repositories/audio-repository";
import { getTranscriptByAudio } from "@/repositories/transcript-repository";
import { PageHeader } from "@/components/admin/page-header";
import { TranscriptManager } from "@/features/admin/transcript/components/transcript-manager";

export const metadata = { title: "Transkrip Audio (Admin)" };
export const revalidate = 0;

export default async function AdminAudioTranscriptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [audio, transcript] = await Promise.all([
    getAudioAdmin(id),
    getTranscriptByAudio(id),
  ]);
  if (!audio) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/admin/audio/${id}/edit`}
          className="rounded-md p-1 text-muted hover:text-foreground"
          aria-label="Kembali"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader
          title={`Transkrip: ${audio.judul}`}
          description="Ambil caption YouTube untuk tampilan karaoke di player"
        />
      </div>

      <TranscriptManager
        audioId={audio.id}
        transcript={
          transcript
            ? {
                status: transcript.status,
                language: transcript.language,
                provider: transcript.provider,
                segmentCount: transcript.segments?.length ?? 0,
              }
            : null
        }
      />
    </div>
  );
}
