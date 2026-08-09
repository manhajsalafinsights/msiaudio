import { BarChart3 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { WeeklyActivityEntry } from "@/repositories/dashboard-repository";

const WEEKDAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export function WeeklyActivity({ days }: { days: WeeklyActivityEntry[] }) {
  const max = Math.max(1, ...days.map((d) => d.count));
  const total = days.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktivitas Mingguan</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="Belum ada aktivitas minggu ini"
            description="Mulai mendengarkan kajian untuk melihat grafik aktivitasmu."
            className="py-10"
          />
        ) : (
          <div className="flex items-end justify-between gap-2 sm:gap-3" role="img" aria-label={`Grafik aktivitas mendengarkan 7 hari terakhir, total ${total} sesi`}>
            {days.map((day) => (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[10px] font-medium text-muted">{day.count}</span>
                <div className="flex h-28 w-full items-end rounded-md bg-border/40">
                  <div
                    className="w-full rounded-md bg-brand transition-all"
                    style={{ height: `${Math.max(4, (day.count / max) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] font-medium text-muted">
                  {WEEKDAY_LABELS[new Date(`${day.date}T00:00:00`).getDay()]}
                </span>
                <span className="text-[10px] text-muted">{day.label}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
