import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import type { WeeklyActivityEntry } from "@/repositories/dashboard-repository";

const WEEKDAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export function WeeklyActivity({ days }: { days: WeeklyActivityEntry[] }) {
  const max = Math.max(1, ...days.map((d) => d.count));
  const total = days.reduce((sum, d) => sum + d.count, 0);

  return (
    <section className="rounded-2xl border border-border bg-surface p-4" aria-label="Aktivitas mingguan">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Aktivitas Mingguan</h2>
        {total > 0 && <span className="text-xs text-muted">{total} sesi</span>}
      </div>
      <div className="mt-4">
        {total === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="Belum ada aktivitas minggu ini"
            description="Mulai mendengarkan kajian untuk melihat grafik aktivitasmu."
            className="py-8"
          />
        ) : (
          <div
            className="flex items-end justify-between gap-1.5 sm:gap-2"
            role="img"
            aria-label={`Grafik aktivitas mendengarkan 7 hari terakhir, total ${total} sesi`}
          >
            {days.map((day) => (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[10px] font-medium text-muted">{day.count}</span>
                <div className="flex h-20 w-full items-end overflow-hidden rounded-md bg-border/40">
                  <div
                    className="w-full rounded-md bg-brand transition-all"
                    style={{ height: `${Math.max(4, (day.count / max) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] font-medium text-muted">
                  {WEEKDAY_LABELS[new Date(`${day.date}T00:00:00`).getDay()]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
