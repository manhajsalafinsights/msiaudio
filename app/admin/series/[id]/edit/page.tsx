import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { listSeriesTypes } from "@/repositories/series-type-repository";
import { listActiveSpeakers } from "@/repositories/speaker-repository";
import { getSeriesAdmin } from "@/repositories/series-repository";
import { prisma } from "@/lib/prisma/client";
import { PageHeader } from "@/components/admin/page-header";
import { SeriesForm } from "@/features/admin/series/components/series-form";

export const metadata = { title: "Edit Series (Admin)" };
export const revalidate = 0;

export default async function AdminSeriesEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [series, kitabOptions, speakerOptions, categoryOptions, tagOptions] = await Promise.all([
    getSeriesAdmin(id),
    listSeriesTypes(),
    listActiveSpeakers(),
    prisma.category.findMany({ select: { id: true, nama: true }, orderBy: { nama: "asc" } }),
    prisma.tag.findMany({ select: { id: true, nama: true }, orderBy: { nama: "asc" } }),
  ]);
  if (!series) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/series" className="rounded-md p-1 text-muted hover:text-foreground" aria-label="Kembali">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader title={`Edit: ${series.judul}`} description="Perbarui data series" />
      </div>

      <SeriesForm
        seriesId={series.id}
        kitabOptions={kitabOptions}
        speakerOptions={speakerOptions}
        categoryOptions={categoryOptions}
        tagOptions={tagOptions}
        audioCount={series._count.audio}
        defaultValues={{
          judul: series.judul,
          slug: series.slug,
          cover: series.cover ?? "",
          deskripsi: series.deskripsi ?? "",
          seriesTypeId: series.seriesTypeId,
          published: series.published,
          speakerIds: series.speakers.map((s) => s.speaker.id),
          categoryIds: series.categories.map((c) => c.category.id),
          tagIds: series.tags.map((t) => t.tag.id),
        }}
      />
    </div>
  );
}
