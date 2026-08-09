"use client";

import { formatDurationHuman } from "@/utils/duration";
import Link from "next/link";
import { Cover } from "@/components/shared/cover";

interface RelatedAudio {
  id: string;
  slug: string;
  judul: string;
  durasi: number;
  cover?: string | null;
  series: { judul: string; cover?: string | null };
  speakers?: { speaker: { nama: string } }[];
}

interface RelatedAudioListProps {
  title?: string;
  audios: RelatedAudio[];
}

export function RelatedAudioList({ title = "Kajian Terkait", audios }: RelatedAudioListProps) {
  if (audios.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {audios.map((audio) => (
          <RelatedAudioCard key={audio.id} audio={audio} />
        ))}
      </div>
    </section>
  );
}

function RelatedAudioCard({ audio }: { audio: RelatedAudio }) {
  const cover = audio.cover ?? audio.series.cover;

  return (
    <Link
      href={`/audio/${audio.slug}`}
      className="card-msi group flex flex-col overflow-hidden"
    >
      {/* Cover */}
      <div className="relative aspect-video overflow-hidden bg-brand/10">
        <Cover src={cover} alt={audio.judul} variant="card" className="h-full w-full rounded-none" />
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
          {formatDurationHuman(audio.durasi)}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 p-3">
        <p className="line-clamp-2 text-sm font-semibold group-hover:text-brand-strong">
          {audio.judul}
        </p>
        <p className="truncate text-xs text-muted">{audio.series.judul}</p>
        {audio.speakers && audio.speakers.length > 0 && (
          <p className="truncate text-xs text-muted">
            {audio.speakers.map((s) => s.speaker.nama).join(", ")}
          </p>
        )}
      </div>
    </Link>
  );
}
