import { Suspense } from "react";
import { prisma } from "@/lib/prisma/client";
import { Heading } from "@/components/ui/typography";
import { StatCard } from "@/components/admin/stat-card";
import { RecentActivity } from "@/components/admin/recent-activity";
import { QuickActions } from "@/components/admin/quick-actions";
import { formatDurationHuman } from "@/utils/duration";
import { Mic, BookOpen, Library, ListMusic, FolderTree, Tags, MessageSquare } from "lucide-react";

export const revalidate = 0;

async function getStats() {
  const [
    ustadz, kitab, series, audio, kategori, tag, komentar,
    ustadzAktif, seriesTerbit, audioTerbit, durasi,
  ] = await Promise.all([
    prisma.speaker.count(),
    prisma.seriesType.count(),
    prisma.series.count(),
    prisma.audio.count(),
    prisma.category.count(),
    prisma.tag.count(),
    prisma.comment.count(),
    prisma.speaker.count({ where: { status: "ACTIVE" } }),
    prisma.series.count({ where: { published: true } }),
    prisma.audio.count({ where: { published: true } }),
    prisma.audio.aggregate({ _sum: { durasi: true } }),
  ]);

  return {
    ustadz, kitab, series, audio, kategori, tag, komentar,
    ustadzAktif, seriesTerbit, audioTerbit,
    totalDurasi: durasi._sum.durasi ?? 0,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Heading as="h1">Dashboard</Heading>
        <p className="mt-1 text-sm text-muted">Ringkasan konten dan aktivitas Admin MSI Audio</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <StatCard
          title="Ustadz"
          value={stats.ustadz}
          sub={`${stats.ustadzAktif.toLocaleString("id-ID")} aktif`}
          icon={<Mic className="h-5 w-5" />}
          href="/admin/ustadz"
        />
        <StatCard
          title="Kitab"
          value={stats.kitab}
          sub="jenis program belajar"
          icon={<BookOpen className="h-5 w-5" />}
          href="/admin/kitab"
        />
        <StatCard
          title="Series"
          value={stats.series}
          sub={`${stats.seriesTerbit.toLocaleString("id-ID")} terbit · ${(stats.series - stats.seriesTerbit).toLocaleString("id-ID")} draft`}
          icon={<Library className="h-5 w-5" />}
          href="/admin/series"
        />
        <StatCard
          title="Audio"
          value={stats.audio}
          sub={`${stats.audioTerbit.toLocaleString("id-ID")} terbit · ${(stats.audio - stats.audioTerbit).toLocaleString("id-ID")} draft · total ${formatDurationHuman(stats.totalDurasi)}`}
          icon={<ListMusic className="h-5 w-5" />}
          href="/admin/audio"
        />
        <StatCard
          title="Kategori"
          value={stats.kategori}
          sub="kelompok konten"
          icon={<FolderTree className="h-5 w-5" />}
          href="/admin/kategori"
        />
        <StatCard
          title="Tag"
          value={stats.tag}
          sub="penanda pencarian"
          icon={<Tags className="h-5 w-5" />}
          href="/admin/tag"
        />
        <div className="col-span-2 sm:col-span-1">
          <StatCard
            title="Komentar"
            value={stats.komentar}
            sub="dari pengunjung"
            icon={<MessageSquare className="h-5 w-5" />}
            href="/admin/komentar"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Activity */}
      <Suspense fallback={<div className="h-48 animate-pulse rounded-xl border border-border bg-surface" />}>
        <RecentActivity />
      </Suspense>
    </div>
  );
}
