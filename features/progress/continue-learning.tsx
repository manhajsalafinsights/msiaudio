import Link from "next/link";
import Image from "next/image";
import { Play, ArrowRight } from "lucide-react";
import { getContinueLearning } from "@/features/progress/progress-actions";
import { formatDurationHuman } from "@/utils/duration";

export async function ContinueLearning() {
  const progress = await getContinueLearning(5);

  if (progress.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4" aria-label="Lanjutkan Belajar">
      <h2 className="text-lg font-semibold">Lanjutkan Belajar</h2>
      <div className="flex flex-col gap-3">
        {progress.map((item) => {
          const audio = item.lastAudio;
          if (!audio) return null;
          const percent = Math.min(100, Math.max(0, Math.round(item.progressPercent)));

          return (
            <div
              key={item.id}
              className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-all hover:shadow-sm hover:border-brand/30"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-brand/10">
                {item.series.cover ? (
                  <Image
                    src={item.series.cover}
                    alt={item.series.judul}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-brand">
                    <Play className="h-5 w-5" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/series/${item.series.slug}`}
                  className="block truncate text-sm font-semibold hover:text-brand"
                >
                  {item.series.judul}
                </Link>
                <p className="mt-0.5 truncate text-xs text-muted">
                  {audio.judul} · {formatDurationHuman(audio.durasi)}
                </p>

                <div className="mt-2 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border/60">
                    <div
                      className="h-full rounded-full bg-brand transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="shrink-0 text-xs font-medium text-brand">{percent}%</span>
                </div>
              </div>

              <Link
                href={`/audio/${audio.slug}`}
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
              >
                Lanjutkan
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
