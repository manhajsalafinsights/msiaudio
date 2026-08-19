import { Suspense } from "react";
import { Music, BookOpen, Headset, User } from "lucide-react";
import { countPublishedAudio } from "@/repositories/audio-repository";
import { countPublishedSeries } from "@/repositories/series-repository";
import { formatCompactCount } from "@/utils/format";

export default function HomeStats() {
  return (
    <Suspense fallback={null}>
      <HomeStatsContent />
    </Suspense>
  );
}

async function HomeStatsContent() {
  const [audioCount, seriesCount] = await Promise.all([
    countPublishedAudio(),
    countPublishedSeries(),
  ]);

  const items = [
    { value: audioCount, label: "Kajian", icon: Music },
    { value: seriesCount, label: "Series", icon: BookOpen },
    { value: getListenerCount(), label: "Pendengar", icon: Headset },
    { value: 2_100, label: "Pengguna", icon: User },
  ];

  return (
    <div className="inline-flex flex-wrap items-center justify-center rounded-full bg-surface px-5 py-2 shadow-sm">
      {items.map((item, i) => (
        <span
          key={item.label}
          aria-label={item.label}
          className="inline-flex items-center gap-x-1.5"
        >
          {i > 0 && <span className="mx-2.5 h-1 w-1 rounded-full bg-secondary/40" aria-hidden />}
          <item.icon className="h-4 w-4 text-brand" aria-hidden />
          <span className="text-sm font-bold text-foreground">{formatCompactCount(item.value)}</span>
        </span>
      ))}
    </div>
  );
}

const PAGI = 10_000;
const SIANG = [5_000, 6_000, 7_000, 8_000];
const MALAM = [21_000, 22_000, 23_000, 24_000, 25_000];

function getListenerCount(): number {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return PAGI;
  if (hour >= 11 && hour < 17) return SIANG[hour - 11];
  return MALAM[(hour + 3) % MALAM.length];
}