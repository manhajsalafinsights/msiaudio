import Link from "next/link";
import { StickyNote } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/utils/duration";
import { formatDistanceToNow } from "@/utils/date";

interface LatestNotesProps {
  items: {
    id: string;
    positionSeconds: number;
    content: string;
    updatedAt: Date;
    audio: {
      judul: string;
      slug: string;
      series: { judul: string; slug: string };
    };
  }[];
}

export function LatestNotes({ items }: LatestNotesProps) {
  return (
    <section className="flex flex-col gap-4" aria-label="Catatan terbaru">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Catatan Terbaru</h2>
        <Button asChild variant="ghost" size="sm">
          <Link href="/user/dashboard/notes">Lihat semua</Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={StickyNote}
          title="Belum ada catatan"
          description="Buat catatan sambil mendengarkan kajian."
          className="py-10"
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-border bg-surface p-3"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <StickyNote className="h-3.5 w-3.5" />
                </span>
                <Link
                  href={`/audio/${item.audio.slug}`}
                  className="min-w-0 flex-1 truncate text-sm font-medium hover:text-brand"
                >
                  {item.audio.judul}
                </Link>
                <span className="shrink-0 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-medium text-brand">
                  {formatDuration(item.positionSeconds)}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-sm text-muted">
                {item.content}
              </p>
              <p className="mt-2 text-xs text-muted">
                {item.audio.series.judul} · {formatDistanceToNow(new Date(item.updatedAt))}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
