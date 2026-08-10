import { Suspense } from "react";
import { Music, BookOpen, User, Eye } from "lucide-react";
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
    { value: audioCount, label: "Kajian", icon: Music },
    { value: seriesCount, label: "Series", icon: BookOpen },
    { value: speakerCount, label: "Pemateri", icon: User },
    { value: userCount, label: "Pengguna", icon: Eye },
  ];

  return (
    <div className="inline-flex flex-wrap items-center justify-center rounded-full border border-brand/20 bg-surface/70 px-5 py-2 backdrop-blur">
      {items.map((item, i) => (
        <span
          key={item.label}
          aria-label={item.label}
          className="inline-flex items-center gap-x-1.5"
        >
          {i > 0 && <span className="mx-2.5 h-1 w-1 rounded-full bg-brand/30" aria-hidden />}
          <item.icon className="h-4 w-4 text-brand" aria-hidden />
          <span className="text-sm font-bold text-foreground">{formatCount(item.value)}</span>
        </span>
      ))}
    </div>
  );
}
