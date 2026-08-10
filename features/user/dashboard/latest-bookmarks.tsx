import Link from "next/link";
import Image from "next/image";
import { Bookmark } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { formatDurationHuman } from "@/utils/duration";

interface LatestBookmarksProps {
  items: {
    id: string;
    audio: {
      judul: string;
      slug: string;
      durasi: number;
      cover: string | null;
      series: { judul: string; slug: string };
    };
  }[];
}

export function LatestBookmarks({ items }: LatestBookmarksProps) {
  return (
    <section className="flex flex-col gap-4" aria-label="Bookmark terbaru">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Bookmark Terbaru</h2>
        <Button asChild variant="ghost" size="sm">
          <Link href="/user/dashboard/bookmarks">Lihat semua</Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Belum ada bookmark"
          description="Simpan audio kajian untuk diakses kembali di sini."
          className="py-10"
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/audio/${item.audio.slug}`}
                className="group flex items-center gap-3 overflow-hidden rounded-xl border border-border bg-surface p-3 transition-all hover:border-brand/30 hover:shadow-sm"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-brand/10">
                  {item.audio.cover ? (
                    <Image
                      src={item.audio.cover}
                      alt={item.audio.judul}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-brand">
                      <Bookmark className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium group-hover:text-brand">
                    {item.audio.judul}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {item.audio.series.judul} · {formatDurationHuman(item.audio.durasi)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
