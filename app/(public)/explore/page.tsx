import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { buildOpenGraph, buildTwitter, canonicalUrl } from "@/lib/seo";
import { Container } from "@/components/ui/container";
import { Heading, Text } from "@/components/ui/typography";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { SeriesCard } from "@/components/shared/series-card";
import { SeriesCardCompact } from "@/components/shared/series-card-compact";
import { SeriesCardSkeleton } from "@/components/shared/series-card-skeleton";
import { AudioRow } from "@/components/shared/audio-row";
import { AudioRowSkeleton } from "@/components/shared/audio-row-skeleton";
import { Pagination } from "@/components/shared/pagination";
import { FilterPanel } from "@/components/shared/filter-panel";
import { AudioFilterPanel } from "@/components/shared/audio-filter-panel";
import { KitabCard } from "@/components/shared/kitab-card";
import { PemateriCard } from "@/components/shared/pemateri-card";
import { ContinueLearning } from "@/features/progress/continue-learning";
import { listCategories } from "@/repositories/category-repository";
import { listSeriesTypes } from "@/repositories/series-type-repository";
import { listActiveSpeakers } from "@/repositories/speaker-repository";
import { listTags } from "@/repositories/tag-repository";
import { listPublishedSeriesOptions } from "@/repositories/series-repository";
import { listSeriesForExplore } from "@/repositories/series-repository";
import { listPublishedSeriesTypes } from "@/repositories/series-type-repository";
import { listPublishedSpeakers } from "@/repositories/speaker-repository";
import { listPublishedCategories } from "@/repositories/category-repository";
import { getSeriesList } from "@/services/series-service";
import { getFilteredAudioList } from "@/services/search-service";
import { isDurationBucket } from "@/repositories/audio-repository";

export const metadata: Metadata = {
  title: "Jelajahi",
  description:
    "Jelajahi semua kajian MSI Audio — filter berdasarkan kategori, kitab, pemateri, tag, atau durasi, lalu lanjutkan belajar.",
  alternates: { canonical: canonicalUrl("/explore") },
  openGraph: buildOpenGraph({
    title: "Jelajahi",
    description:
      "Jelajahi semua kajian MSI Audio — filter berdasarkan kategori, kitab, pemateri, tag, atau durasi, lalu lanjutkan belajar.",
    url: canonicalUrl("/explore"),
  }),
  twitter: buildTwitter({
    title: "Jelajahi",
    description:
      "Jelajahi semua kajian MSI Audio — filter berdasarkan kategori, kitab, pemateri, tag, atau durasi, lalu lanjutkan belajar.",
  }),
};

const PER_PAGE = 20;
const SERIES_SORTS = [
  "terbaru",
  "terlama",
  "az",
  "za",
  "durasi_asc",
  "durasi_desc",
  "terbanyak_audio",
] as const;
const AUDIO_SORTS = ["terbaru", "terlama", "az", "za", "durasi_asc", "durasi_desc"] as const;

function sanitizeSort(sort: string | undefined, allowed: readonly string[]): string {
  return sort && allowed.includes(sort) ? sort : "terbaru";
}

function TabLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      role="tab"
      aria-selected={active}
      className={
        active
          ? "inline-flex items-center justify-center whitespace-nowrap rounded-sm bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow-sm"
          : "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-background/50 hover:text-foreground"
      }
    >
      {children}
    </Link>
  );
}

async function SeriesBrowse({
  page,
  q,
  kategori,
  type,
  ustadz,
  tag,
  sort,
}: {
  page: number;
  q?: string;
  kategori?: string;
  type?: string;
  ustadz?: string;
  tag?: string;
  sort?: string;
}) {
  const result = await getSeriesList(page, PER_PAGE, {
    q,
    categoryId: kategori,
    seriesTypeId: type,
    speakerId: ustadz,
    tagId: tag,
    sort: sanitizeSort(sort, SERIES_SORTS) as (typeof SERIES_SORTS)[number],
  });

  if (result.items.length === 0) {
    return (
      <EmptyState
        title="Tidak ada series ditemukan"
        description="Coba ubah filter atau kata kunci pencarian."
        action={
          <Button asChild>
            <Link href="/series">Lihat Semua Series</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {result.items.map((series) => (
          <SeriesCard key={series.id} series={series} />
        ))}
      </div>
      <Pagination page={page} totalPages={result.totalPages} baseHref="/explore" />
    </div>
  );
}

async function AudioBrowse({
  page,
  q,
  seriesId,
  type,
  ustadz,
  kategori,
  tag,
  durasi,
  sort,
}: {
  page: number;
  q?: string;
  seriesId?: string;
  type?: string;
  ustadz?: string;
  kategori?: string;
  tag?: string;
  durasi?: string;
  sort?: string;
}) {
  const result = await getFilteredAudioList(page, PER_PAGE, {
    q,
    seriesId,
    seriesTypeId: type,
    speakerId: ustadz,
    categoryId: kategori,
    tagId: tag,
    duration: durasi && isDurationBucket(durasi) ? durasi : undefined,
    sort: sanitizeSort(sort, AUDIO_SORTS) as (typeof AUDIO_SORTS)[number],
  });

  if (result.items.length === 0) {
    return (
      <EmptyState
        title="Tidak ada audio ditemukan"
        description="Coba ubah filter atau kata kunci pencarian."
        action={
          <Button asChild>
            <Link href="/explore?tab=audio">Reset Semua</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col gap-2">
        {result.items.map((audio) => (
          <AudioRow key={audio.id} audio={audio} />
        ))}
      </ul>
      <Pagination page={page} totalPages={result.totalPages} baseHref="/explore" />
    </div>
  );
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const { q, kategori, type, ustadz, tag, series: seriesId, durasi, sort, page, tab } = params;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10) || 1);

  // Tab Phase 10 (filter browse) — dipertahankan untuk kompatibilitas /search & eksplorasi terfilter.
  if (tab === "audio" || tab === "series") {
    const currentTab = tab;
    const [categories, seriesTypes, speakers, tags, publishedSeries] = await Promise.all([
      listCategories(),
      listSeriesTypes(),
      listActiveSpeakers(),
      listTags(),
      listPublishedSeriesOptions(),
    ]);

    return (
      <Container size="wide" className="flex flex-col gap-6 py-8">
        <Heading as="h1">Jelajahi</Heading>
        <div
          role="tablist"
          aria-label="Pilih konten"
          className="inline-flex h-10 w-fit items-center justify-center rounded-md bg-muted p-1"
        >
          <TabLink href="/explore?tab=series" active={currentTab === "series"}>
            Series
          </TabLink>
          <TabLink href="/explore?tab=audio" active={currentTab === "audio"}>
            Audio
          </TabLink>
        </div>

        {currentTab === "series" ? (
          <div className="flex flex-col gap-6">
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
            />
            <Suspense
              fallback={
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <SeriesCardSkeleton key={i} />
                  ))}
                </div>
              }
            >
              <SeriesBrowse
                page={currentPage}
                q={q}
                kategori={kategori}
                type={type}
                ustadz={ustadz}
                tag={tag}
                sort={sort}
              />
            </Suspense>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <AudioFilterPanel
              series={publishedSeries.map((s) => ({ id: s.id, nama: s.judul }))}
              seriesTypes={seriesTypes}
              speakers={speakers}
              categories={categories}
              tags={tags}
              currentSeries={seriesId}
              currentSeriesType={type}
              currentSpeaker={ustadz}
              currentCategory={kategori}
              currentTag={tag}
              currentDuration={durasi}
              currentSort={sort}
              currentSearch={q}
            />
            <Suspense
              fallback={
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <AudioRowSkeleton key={i} />
                  ))}
                </div>
              }
            >
              <AudioBrowse
                page={currentPage}
                q={q}
                seriesId={seriesId}
                type={type}
                ustadz={ustadz}
                kategori={kategori}
                tag={tag}
                durasi={durasi}
                sort={sort}
              />
            </Suspense>
          </div>
        )}
      </Container>
    );
  }

  // ===== Mode discovery (Phase 11) =====
  const [latestSeries, kitabList, pemateriList, kategoriList] = await Promise.all([
    listSeriesForExplore(8),
    listPublishedSeriesTypes(),
    listPublishedSpeakers(),
    listPublishedCategories(),
  ]);

  return (
    <Container size="wide" className="flex flex-col gap-10 py-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Heading as="h1">Temukan Kajian</Heading>
          <Text variant="muted" className="max-w-2xl">
            Jelajahi kajian Islam dari series, kitab, pemateri, hingga kategori yang
            sesuai minat Anda — dan lanjutkan belajar di mana pun Anda berhenti.
          </Text>
        </div>

        <form
          action="/search"
          role="search"
          aria-label="Cari kajian"
          className="flex w-full max-w-xl flex-col gap-2 sm:flex-row"
        >
          <input
            type="search"
            name="q"
            placeholder="Cari series, kitab, ustadz, atau tema..."
            className="input h-12 flex-1"
          />
          <button type="submit" className="btn btn-primary btn-lg shrink-0">
            Cari
          </button>
        </form>
      </div>

      <ContinueLearning />

      <section className="flex flex-col gap-4" aria-label="Series terbaru">
        <div className="flex items-center justify-between">
          <Heading as="h2" className="text-xl md:text-2xl">
            Series Terbaru
          </Heading>
          <Button asChild variant="ghost" size="sm">
            <Link href="/series">
              Lihat Semua
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
        {latestSeries.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {latestSeries.map((series) => (
              <SeriesCardCompact key={series.id} series={series} />
            ))}
          </div>
        ) : (
          <EmptyState title="Belum ada series" description="Konten kajian akan segera hadir." />
        )}
      </section>

      <section className="flex flex-col gap-4" aria-label="Kitab">
        <div className="flex items-center justify-between">
          <Heading as="h2" className="text-xl md:text-2xl">
            Kitab
          </Heading>
          <Button asChild variant="ghost" size="sm">
            <Link href="/kitab">
              Lihat Semua
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
        {kitabList.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {kitabList.map((k) => (
              <KitabCard key={k.id} kitab={k} />
            ))}
          </div>
        ) : (
          <EmptyState title="Belum ada kitab" description="Kajian kitab akan segera hadir." />
        )}
      </section>

      <section className="flex flex-col gap-4" aria-label="Pemateri">
        <div className="flex items-center justify-between">
          <Heading as="h2" className="text-xl md:text-2xl">
            Pemateri
          </Heading>
          <Button asChild variant="ghost" size="sm">
            <Link href="/pemateri">
              Lihat Semua
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
        {pemateriList.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pemateriList.map((p) => (
              <PemateriCard key={p.id} pemateri={p} />
            ))}
          </div>
        ) : (
          <EmptyState title="Belum ada pemateri" description="Profil pemateri akan segera hadir." />
        )}
      </section>

      <section className="flex flex-col gap-4" aria-label="Kategori">
        <div className="flex items-center justify-between">
          <Heading as="h2" className="text-xl md:text-2xl">
            Kategori
          </Heading>
          <Button asChild variant="ghost" size="sm">
            <Link href="/kategori">
              Lihat Semua
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
        {kategoriList.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {kategoriList.map((c) => (
              <Link
                key={c.id}
                href={`/kategori/${c.slug}`}
                className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium transition-colors hover:border-brand/30 hover:text-brand"
              >
                {c.nama}
                <span className="ml-1.5 text-xs text-muted">{c.seriesCount}</span>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="Belum ada kategori" description="Kategori kajian akan segera hadir." />
        )}
      </section>
    </Container>
  );
}
