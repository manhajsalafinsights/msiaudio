import Link from "next/link";
import { Suspense } from "react";
import { Play } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/shared/section-header";
import { AudioBook } from "@/components/shared/audio-book";
import { formatDuration } from "@/utils/duration";
import { AutoRotatingList } from "@/features/home/components/auto-rotating-list";
import { getPromoLearningAudios } from "@/services/audio-service";
import type { AudioCard } from "@/repositories/audio-repository";

type LearningPick = {
  label: string;
  audio: AudioCard;
};

function LearningPickCard({ pick }: { pick: LearningPick }) {
  const { label, audio } = pick;
  const speakerName = audio.series?.speakers[0]?.speaker.nama;
  const meta = speakerName ?? audio.series?.judul;

  return (
    <div className="group flex h-full flex-col gap-2.5 rounded-2xl p-1.5 transition-colors duration-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.06]">
      <Link href={`/audio/${audio.slug}`} className="flex h-full flex-col gap-2.5">
        <span className="relative block aspect-[4/3] w-full overflow-hidden">
          <AudioBook
            src={audio.cover ?? audio.series?.cover}
            alt={audio.judul}
            className="h-full w-full rounded-none"
          />

          <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {label}
          </span>

          <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-1 text-xs font-medium tabular-nums text-white backdrop-blur-sm">
            {formatDuration(audio.durasi)}
          </span>
        </span>

        <span className="flex flex-col gap-1 px-0.5">
          <span className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-brand">
            {audio.judul}
          </span>
          {meta && <span className="truncate text-xs text-muted">{meta}</span>}
        </span>

        <span className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-full bg-brand/10 px-3.5 py-1.5 text-xs font-semibold text-brand transition-colors group-hover:bg-brand group-hover:text-white">
          <Play className="h-3.5 w-3.5 fill-current" aria-hidden />
          Dengarkan
        </span>
      </Link>
    </div>
  );
}

export function LearningPicksSection() {
  return (
    <Container className="py-4 sm:py-5">
      <SectionHeader title="Pilihan Untuk Belajar" />
      <Suspense
        fallback={
          <div className="-mx-4 flex gap-3 overflow-hidden px-4 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:px-0">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-[78%] flex-none sm:w-64 md:w-auto">
                <div className="skeleton aspect-[4/3] w-full rounded-2xl" />
                <div className="skeleton mt-2 h-4 w-full rounded" />
                <div className="skeleton mt-1.5 h-3 w-2/3 rounded" />
              </div>
            ))}
          </div>
        }
      >
        <LearningPicksList />
      </Suspense>
    </Container>
  );
}

async function LearningPicksList() {
  const picks = await getPromoLearningAudios();
  if (picks.length === 0) return null;

  return (
    <AutoRotatingList
      ariaLabel="Pilihan untuk belajar yang berganti otomatis"
      slidesPerView={{ base: 2, sm: 2, md: 3 }}
      items={picks.map((pick) => (
        <LearningPickCard key={pick.label} pick={pick} />
      ))}
    />
  );
}
