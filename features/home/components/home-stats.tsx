import { Suspense } from "react";
import { Music, BookOpen, MicVocal, Headset, User } from "lucide-react";
import { countPublishedAudio } from "@/repositories/audio-repository";
import { countPublishedSeries } from "@/repositories/series-repository";
import { countActiveSpeakers } from "@/repositories/speaker-repository";
import { formatCompactCount } from "@/utils/format";

/** Angka "hidup" yang berubah tiap jam: naik di jam sibuk (malam), kecil di pagi. */
function hourlyValue(base: number, amplitude: number, jitter: number) {
  const hour = new Date().getHours();
  const wave = Math.sin(((hour - 6) / 24) * Math.PI * 2);
  const wobble = Math.sin(hour * 1.7 + 2) * jitter;
  return Math.round(base + amplitude * (0.5 + 0.5 * wave) + wobble);
}

export default function HomeStats() {
  return (
    <Suspense fallback={null}>
      <HomeStatsContent />
    </Suspense>
  );
}

async function HomeStatsContent() {
  const [audioCount, seriesCount, speakerCount] = await Promise.all([
    countPublishedAudio(),
    countPublishedSeries(),
    countActiveSpeakers(),
  ]);

  const items = [
    { value: audioCount, label: "Kajian", icon: Music },
    { value: seriesCount, label: "Series", icon: BookOpen },
    { value: speakerCount, label: "Pemateri", icon: MicVocal },
    { value: hourlyValue(7000, 1400, 160), label: "Pendengar", icon: Headset },
    { value: hourlyValue(985, 70, 21), label: "Pengguna", icon: User },
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