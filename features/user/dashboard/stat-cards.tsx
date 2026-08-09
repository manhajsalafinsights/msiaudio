import { Headphones, CheckCircle2, BookMarked, Clock, Bookmark, StickyNote } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatDurationHuman } from "@/utils/duration";

interface StatCardsProps {
  statistics: {
    totalAudioDidengar: number;
    totalAudioSelesai: number;
    totalMenit: number;
    totalSeriesDiikuti: number;
    totalBookmark: number;
    totalCatatan: number;
  };
}

type StatItem = {
  label: string;
  value: string;
  icon: LucideIcon;
};

export function StatCards({ statistics }: StatCardsProps) {
  const items: StatItem[] = [
    { label: "Audio Didengar", value: String(statistics.totalAudioDidengar), icon: Headphones },
    { label: "Audio Selesai", value: String(statistics.totalAudioSelesai), icon: CheckCircle2 },
    { label: "Series Diikuti", value: String(statistics.totalSeriesDiikuti), icon: BookMarked },
    {
      label: "Total Menit",
      value:
        statistics.totalMenit === 0
          ? "0 mnt"
          : formatDurationHuman(statistics.totalMenit * 60),
      icon: Clock,
    },
    { label: "Bookmark", value: String(statistics.totalBookmark), icon: Bookmark },
    { label: "Catatan", value: String(statistics.totalCatatan), icon: StickyNote },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6" aria-label="Statistik belajar">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center gap-2 text-muted">
            <item.icon className="h-4 w-4" aria-hidden />
            <p className="text-xs">{item.label}</p>
          </div>
          <p className="mt-2 text-xl font-bold tracking-tight">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
