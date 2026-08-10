import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { Search, ArrowRight } from "lucide-react";
import { canonicalUrl } from "@/lib/seo";
import { getRecentAudio } from "@/services/audio-service";
import { getSeriesList } from "@/services/series-service";
import { listCategories } from "@/repositories/category-repository";
import {
  listPublishedSeriesTypes,
  findPublishedSeriesTypeBySlug,
} from "@/repositories/series-type-repository";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { SeriesCardCompact } from "@/components/shared/series-card-compact";
import { AudioCard } from "@/components/shared/audio-card";
import { KitabCard } from "@/components/shared/kitab-card";
import { SectionHeader } from "@/components/shared/section-header";
import { ContinueLearning } from "@/features/progress/continue-learning";
import HeroSection from "@/features/home/components/hero-section";
import HomeStats from "@/features/home/components/home-stats";

export const revalidate = 60;

export const metadata: Metadata = {
  alternates: { canonical: canonicalUrl("/") },
};

/* ================================================================
   Kajian Terbaru
   ================================================================ */

function LatestAudioSection() {
  return (
    <Container className="pt-2 pb-5">
      <SectionHeader title="Kajian Terbaru" moreHref="/explore" />
      <Suspense
        fallback={
          <div className="flex gap-1 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-[45%] flex-none sm:w-56 lg:w-72">
                <div className="skeleton aspect-square w-full rounded-xl" />
                <div className="skeleton mt-2.5 h-4 w-full rounded" />
                <div className="skeleton mt-1.5 h-3 w-2/3 rounded" />
              </div>
            ))}
          </div>
        }
      >
        <LatestAudioList />
      </Suspense>
    </Container>
  );
}

async function LatestAudioList() {
  const audioList = await getRecentAudio(10);
  if (audioList.length === 0) {
    return <EmptyState title="Belum ada kajian" description="Kajian akan muncul di sini." />;
  }
  return (
    <ul className="flex gap-1 overflow-x-auto pb-2 -mx-4 px-4 snap-x sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      {audioList.map((audio) => (
        <AudioCard key={audio.id} audio={audio} />
      ))}
    </ul>
  );
}

/* ================================================================
   Pilihan Kitab
   ================================================================ */

function KitabSection() {
  return (
    <Container className="py-5">
      <SectionHeader title="Pilihan Kitab" moreHref="/kitab" />
      <Suspense
        fallback={
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-20 rounded-xl" />
            ))}
          </div>
        }
      >
        <KitabGrid />
      </Suspense>
    </Container>
  );
}

async function KitabGrid() {
  const kitabList = await listPublishedSeriesTypes();
  if (kitabList.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {kitabList.map((kitab) => (
        <KitabCard key={kitab.id} kitab={kitab} />
      ))}
    </div>
  );
}

/* ================================================================
   Tematik
   ================================================================ */

function TematikSection() {
  return (
    <Container className="py-5">
      <SectionHeader title="Tematik" moreHref="/kitab/tematik" />
      <Suspense
        fallback={
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-20 rounded-xl" />
            ))}
          </div>
        }
      >
        <TematikGrid />
      </Suspense>
    </Container>
  );
}

async function TematikGrid() {
  const tematik = await findPublishedSeriesTypeBySlug("tematik");
  if (!tematik || tematik.series.length === 0) {
    return (
      <EmptyState title="Belum ada tematik" description="Kajian tematik akan muncul di sini." />
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tematik.series.map((series) => (
        <SeriesCardCompact key={series.id} series={series} />
      ))}
    </div>
  );
}

/* ================================================================
   Kategori
   ================================================================ */

function CategoriesSection() {
  return (
    <Container className="py-5">
      <SectionHeader title="Kategori" moreHref="/explore" />
      <CategoriesGrid />
    </Container>
  );
}

async function CategoriesGrid() {
  const categories = await listCategories();
  if (categories.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/kategori/${category.slug}`}
          className="chip hover:border-brand/30 hover:bg-brand/5"
        >
          {category.nama}
        </Link>
      ))}
    </div>
  );
}

/* ================================================================
   Series Terbaru
   ================================================================ */

function LatestSeriesSection() {
  return (
    <Container className="py-5">
      <SectionHeader title="Series Terbaru" moreHref="/series" />
      <Suspense
        fallback={
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-20 rounded-xl" />
            ))}
          </div>
        }
      >
        <LatestSeriesGrid />
      </Suspense>
    </Container>
  );
}

async function LatestSeriesGrid() {
  const result = await getSeriesList(1, 4, { sort: "terbaru" });
  if (result.items.length === 0) {
    return <EmptyState title="Belum ada series" description="Series akan muncul di sini." />;
  }
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {result.items.map((series) => (
        <SeriesCardCompact key={series.id} series={series} />
      ))}
    </div>
  );
}

/* ================================================================
   Temukan Kajian — CTA pencarian
   ================================================================ */

function DiscoverSection() {
  return (
    <Container className="py-10">
      <div className="card card-outlined relative overflow-hidden p-8 text-center md:p-12">
        <div
          className="absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-brand/5"
          aria-hidden
        />
        <div className="relative flex flex-col items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand">
            <Search className="h-6 w-6" aria-hidden />
          </span>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Temukan Kajian</h2>
          <p className="max-w-md text-sm text-muted md:text-base">
            Cari berdasarkan judul, kitab, pemateri, atau tema. Semua kajian tersusun rapi untuk
            memudahkan belajarmu.
          </p>
          <form
            action="/search"
            role="search"
            aria-label="Cari kajian"
            className="flex w-full max-w-md flex-col gap-2 sm:flex-row"
          >
            <input
              type="search"
              name="q"
              placeholder="Cari series, kitab, ustadz..."
              className="input h-12"
            />
            <button type="submit" className="btn btn-primary btn-lg shrink-0">
              Cari
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </form>
        </div>
      </div>
    </Container>
  );
}

/* ================================================================
   Home Page
   ================================================================ */

export default function HomePage() {
  return (
    <>
      <HeroSection stats={<HomeStats />} />
      <LatestAudioSection />
      <Container className="pt-2 pb-4">
        <Suspense>
          <ContinueLearning />
        </Suspense>
      </Container>
      <KitabSection />
      <TematikSection />
      <CategoriesSection />
      <LatestSeriesSection />
      <DiscoverSection />
    </>
  );
}
