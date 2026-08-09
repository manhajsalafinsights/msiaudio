import Link from "next/link";
import { prisma } from "@/lib/prisma/client";
import { formatDistanceToNow } from "@/utils/date";
import { ListMusic, Library, Mic } from "lucide-react";

type ActivityItem = {
  id: string;
  type: "audio" | "series" | "ustadz";
  label: string;
  parent?: string;
  createdAt: Date;
  href: string;
};

const typeMeta = {
  audio: { label: "Audio", icon: ListMusic, href: (id: string) => `/admin/audio/${id}/edit` },
  series: { label: "Series", icon: Library, href: (id: string) => `/admin/series/${id}/edit` },
  ustadz: { label: "Ustadz", icon: Mic, href: (id: string) => `/admin/ustadz/${id}/edit` },
} as const;

export async function RecentActivity() {
  const [audios, series, speakers] = await Promise.all([
    prisma.audio.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      select: { id: true, judul: true, createdAt: true, series: { select: { judul: true } } },
    }),
    prisma.series.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      select: { id: true, judul: true, createdAt: true },
    }),
    prisma.speaker.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      select: { id: true, nama: true, createdAt: true },
    }),
  ]);

  const items: ActivityItem[] = [
    ...audios.map((a) => ({
      id: a.id,
      type: "audio" as const,
      label: a.judul,
      parent: a.series?.judul,
      createdAt: a.createdAt,
      href: typeMeta.audio.href(a.id),
    })),
    ...series.map((s) => ({
      id: s.id,
      type: "series" as const,
      label: s.judul,
      createdAt: s.createdAt,
      href: typeMeta.series.href(s.id),
    })),
    ...speakers.map((sp) => ({
      id: sp.id,
      type: "ustadz" as const,
      label: sp.nama,
      createdAt: sp.createdAt,
      href: typeMeta.ustadz.href(sp.id),
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 8);

  if (items.length === 0) {
    return (
      <div className="card card-outlined p-5">
        <h3 className="text-sm font-semibold">Aktivitas Terbaru</h3>
        <p className="mt-2 text-sm text-muted">Belum ada aktivitas.</p>
      </div>
    );
  }

  return (
    <div className="card card-outlined p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Aktivitas Terbaru</h3>
        <span className="text-xs text-muted">{items.length} item terakhir</span>
      </div>
      <ul className="mt-4 divide-y divide-border">
        {items.map((item) => {
          const meta = typeMeta[item.type];
          return (
            <li key={`${item.type}-${item.id}`} className="py-3 first:pt-0 last:pb-0">
              <Link href={item.href} className="flex items-center justify-between gap-3 rounded-md transition-colors hover:text-brand">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <meta.icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.label}</p>
                    {item.parent && <p className="truncate text-xs text-muted">{item.parent}</p>}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="hidden text-xs text-muted sm:inline">{meta.label}</span>
                  <span className="text-xs text-muted">{formatDistanceToNow(item.createdAt)}</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
