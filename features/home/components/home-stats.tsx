import { Suspense } from "react";
import { countPublishedAudio } from "@/repositories/audio-repository";
import { countPublishedSeries } from "@/repositories/series-repository";
import { countActiveSpeakers } from "@/repositories/speaker-repository";
import { countUsers } from "@/repositories/user-repository";
import { formatCount } from "@/utils/format";

export default function HomeStats() {
  return (
    <Suspense fallback={null}>
      <HomeStatsContent />
    </Suspense>
  );
}

async function HomeStatsContent() {
  const [audioCount, seriesCount, speakerCount, userCount] = await Promise.all([
    countPublishedAudio(),
    countPublishedSeries(),
    countActiveSpeakers(),
    countUsers(),
  ]);

  const items = [
    { value: audioCount, label: "Kajian" },
    { value: seriesCount, label: "Series" },
    { value: speakerCount, label: "Pemateri" },
    { value: userCount, label: "Pengguna" },
  ];

  return (
    <div className="inline-flex flex-wrap items-center justify-center rounded-full border border-brand/20 bg-surface/70 px-5 py-2 backdrop-blur">
      {items.map((item, i) => (
        <span key={item.label} className="inline-flex items-center gap-x-1.5">
          {i > 0 && <span className="mx-2.5 h-1 w-1 rounded-full bg-brand/30" aria-hidden />}
          <span className="text-sm font-bold text-foreground">{formatCount(item.value)}</span>
          <span className="text-xs text-muted">{item.label}</span>
        </span>
      ))}
    </div>
  );
}
