import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { buildOpenGraph, buildTwitter, canonicalUrl } from "@/lib/seo";
import { listCategories } from "@/repositories/category-repository";
import { listSeriesTypes } from "@/repositories/series-type-repository";
import { listActiveSpeakers } from "@/repositories/speaker-repository";
import { listTags } from "@/repositories/tag-repository";
import { getSeriesList } from "@/services/series-service";
import { getProgressBySeriesIds } from "@/repositories/progress-repository";
import { getCurrentUser } from "@/lib/auth/session";
import { Container } from "@/components/ui/container";
import { Heading, Text } from "@/components/ui/typography";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterPanel } from "@/components/shared/filter-panel";
import { SeriesCard } from "@/components/shared/series-card";
import { SeriesCardSkeleton } from "@/components/shared/series-card-skeleton";
import { Pagination } from "@/components/shared/pagination";
import { Breadcrumb } from "@/components/shared/breadcrumb";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Semua Series",
  description:
    "Jelajahi seluruh series kajian Islam — pilih kategori, kitab, pemateri, atau tag untuk mulai belajar.",
  alternates: { canonical: canonicalUrl("/series") },
  openGraph: buildOpenGraph({
    title: "Semua Series",
    description:
      "Jelajahi seluruh series kajian Islam — pilih kategori, kitab, pemateri, atau tag untuk mulai belajar.",
    url: canonicalUrl("/series"),
  }),
  twitter: buildTwitter({
    title: "Semua Series",
    description:
      "Jelajahi seluruh series kajian Islam — pilih kategori, kitab, pemateri, atau tag untuk mulai belajar.",
  }),
};

const PER_PAGE = 12;
const SERIES_SORTS = [
  "terbaru",
  "terlama",
  "az",
  "za",
  "durasi_asc",
  "durasi_desc",
  "terbanyak_audio",
] as const;

function sanitizeSort(sort: string | undefined): string {
  return sort && SERIES_SORTS.includes(sort as (typeof SERIES_SORTS)[number]) ? sort : "terbaru";
}

export default async function SeriesListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { q, kategori, type, ustadz, tag, sort, page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10) || 1);
  const [categories, seriesTypes, speakers, tags] = await Promise.all([
    listCategories(),
    listSeriesTypes(),
    listActiveSpeakers(),
    listTags(),
  ]);

  return (
    <Container size="wide" className="flex flex-col gap-8 py-8">
      <Breadcrumb items={[{ label: "Beranda", href: "/" }, { label: "Series" }]} />

      <div className="flex flex-col gap-2">
        <Heading as="h1">Semua Series</Heading>
        <Text variant="muted" className="max-w-lg">
          Jelajahi semua kajian terorganisir dalam series — pilih kategori, kitab, ustadz, atau
          tag untuk memulai belajar.
        </Text>
      </div>

      <div className="sticky top-16 z-20 bg-background/95 py-2 backdrop-blur md:static md:bg-transparent md:py-0 md:backdrop-blur-none">
        <FilterPanel
          categories={categories}
          seriesTypes={seriesTypes}
          speakers={speakers}
          tags={tags}
          currentCategory={kategori}
          currentSeriesType={type}
          currentSpeaker={ustadz}
          currentTag={tag}
          currentSort={sort}
          currentSearch={q}
          baseHref="/series"
        />
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: PER_PAGE }).map((_, i) => (
              <SeriesCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <SeriesGrid
          page={currentPage}
          q={q}
          categoryId={kategori}
          speakerId={ustadz}
          seriesTypeId={type}
          tagId={tag}
          sort={sanitizeSort(sort)}
        />
      </Suspense>
    </Container>
  );
}

async function SeriesGrid({
  page,
  q,
  categoryId,
  speakerId,
  seriesTypeId,
  tagId,
  sort,
}: {
  page: number;
  q?: string;
  categoryId?: string;
  speakerId?: string;
  seriesTypeId?: string;
  tagId?: string;
  sort: string;
}) {
  const [result, user] = await Promise.all([
    getSeriesList(page, PER_PAGE, {
      q,
      categoryId,
      speakerId,
      seriesTypeId,
      tagId,
      sort: sort as (typeof SERIES_SORTS)[number],
    }),
    getCurrentUser(),
  ]);

  if (result.items.length === 0) {
    return (
      <EmptyState
        title="Tidak ada series ditemukan"
        description="Coba ubah filter atau kata kunci pencarian."
        action={
          <Link
            href="/series"
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white"
          >
            Reset Semua
          </Link>
        }
      />
    );
  }

  // Progress user (hanya jika login) — batch, tanpa N+1.
  const progressMap = new Map<string, { completedCount: number; progressPercent: number; lastAudioId: string | null }>();
  if (user) {
    const rows = await getProgressBySeriesIds(
      user.id,
      result.items.map((s) => s.id),
    );
    for (const row of rows) {
      progressMap.set(row.seriesId, row);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {result.items.map((series) => {
          const progress = progressMap.get(series.id);
          return (
            <SeriesCard
              key={series.id}
              series={series}
              progressPercent={progress?.progressPercent}
              progressLabel={
                progress ? `${progress.completedCount} / ${series.totalSesi} sesi` : undefined
              }
            />
          );
        })}
      </div>
      <Pagination page={page} totalPages={result.totalPages} baseHref="/series" />
    </div>
  );
}
