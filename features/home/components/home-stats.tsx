import { Suspense } from "react";
import { Music, BookOpen, Headset, User } from "lucide-react";
import { countPublishedAudio } from "@/repositories/audio-repository";
import { countPublishedSeries } from "@/repositories/series-repository";
import { countUsers } from "@/repositories/user-repository";
import { countListeners } from "@/repositories/history-repository";
import { formatCompactCount } from "@/utils/format";

export default function HomeStats() {
  return (
    <Suspense fallback={null}>
      <HomeStatsContent />
    </Suspense>
  );
}

async function HomeStatsContent() {
  const [audioCount, seriesCount, listenerCount, userCount] = await Promise.all([
    countPublishedAudio(),
    countPublishedSeries(),
    countListeners(),
    countUsers(),
  ]);

  const items = [
    { value: audioCount, label: "Kajian", icon: Music },
    { value: seriesCount, label: "Series", icon: BookOpen },
    { value: listenerCount, label: "Pendengar", icon: Headset },
    { value: userCount, label: "Pengguna", icon: User },
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
          <span className="text-sm font-bold text-foreground">{formatCompactCount(item.value)}</span>
        </span>
      ))}
    </div>
  );
}