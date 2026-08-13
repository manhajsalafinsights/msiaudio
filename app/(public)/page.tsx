import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import {
  BookOpen,
  BookMarked,
  ChevronRight,
  FolderOpen,
  HeartHandshake,
  Landmark,
  Scale,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Star,
  type LucideIcon,
} from "lucide-react";
import { canonicalUrl } from "@/lib/seo";
import { getRecentAudio } from "@/services/audio-service";
import { getSeriesList } from "@/services/series-service";
import { listPublishedCategories } from "@/repositories/category-repository";
import {
  listPublishedSeriesTypes,
  findPublishedSeriesTypeBySlug,
} from "@/repositories/series-type-repository";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { SeriesCard } from "@/components/shared/series-card";
import { AudioCard } from "@/components/shared/audio-card";
import { KitabCard } from "@/components/shared/kitab-card";
import { SectionHeader } from "@/components/shared/section-header";
import { ContinueLearning } from "@/features/progress/continue-learning";
import HeroSection from "@/features/home/components/hero-section";
import HomeStats from "@/features/home/components/home-stats";
import { HomeSearch } from "@/features/home/components/home-search";
import { AutoRotatingList } from "@/features/home/components/auto-rotating-list";
import { LearningPicksSection } from "@/features/home/components/learning-picks";

export const revalidate = 60;

export const metadata: Metadata = {
  alternates: { canonical: canonicalUrl("/") },
};

/* ================================================================
   Kajian Terbaru — fokus utama. Desktop grid 4 kolom,
   mobile horizontal scroll dengan kartu yang nyaman.
   ================================================================ */

function LatestAudioSection() {
  return (
    <Container className="pt-1 pb-4 sm:pb-5">
      <SectionHeader title="Kajian Terbaru" moreHref="/explore" />
      <Suspense
        fallback={
          <div className="-mx-4 flex gap-3 overflow-hidden px-4 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:px-0 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-[68%] flex-none sm:w-60 md:w-auto">
                <div className="skeleton aspect-square w-full rounded-xl" />
                <div className="skeleton mt-2 h-4 w-full rounded" />
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
  const audioList = await getRecentAudio(8);
  if (audioList.length === 0) {
    return <EmptyState title="Belum ada kajian" description="Kajian akan muncul di sini." />;
  }
  return (
    <AutoRotatingList
      ariaLabel="Kajian terbaru yang berganti otomatis"
      slidesPerView={{ base: 2, sm: 2, md: 3, lg: 4 }}
      items={audioList.map((audio) => (
        <AudioCard key={audio.id} audio={audio} />
      ))}
    />
  );
}

/* ================================================================
   Pilihan Kitab
   ================================================================ */

function KitabSection() {
  return (
    <Container className="py-4 sm:py-5">
      <SectionHeader title="Pilihan Kitab" moreHref="/kitab" />
      <Suspense
        fallback={
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-20 rounded-2xl" />
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
   Series Terbaru — katalog audio, cover sebagai elemen utama
   ================================================================ */

function LatestSeriesSection() {
  return (
    <Container className="py-4 sm:py-5">
      <SectionHeader title="Series Terbaru" moreHref="/series" />
      <Suspense
        fallback={
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton aspect-[4/3] rounded-2xl" />
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
        <SeriesCard key={series.id} series={series} />
      ))}
    </div>
  );
}

/* ================================================================
   Tematik
   ================================================================ */

function TematikSection() {
  return (
    <Container className="py-4 sm:py-5">
      <SectionHeader title="Tematik" moreHref="/kitab/tematik" />
      <Suspense
        fallback={
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton aspect-[4/3] rounded-2xl" />
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
      {tematik.series.slice(0, 4).map((series) => (
        <SeriesCard key={series.id} series={series} />
      ))}
    </div>
  );
}

/* ================================================================
   Parenting
   ================================================================ */

function ParentingSection() {
  return (
    <Container className="py-4 sm:py-5">
      <SectionHeader title="Parenting" moreHref="/kitab/parenting" />
      <Suspense
        fallback={
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton aspect-[4/3] rounded-2xl" />
            ))}
          </div>
        }
      >
        <ParentingGrid />
      </Suspense>
    </Container>
  );
}

async function ParentingGrid() {
  const parenting = await findPublishedSeriesTypeBySlug("parenting");
  if (!parenting || parenting.series.length === 0) {
    return (
      <EmptyState
        title="Belum ada parenting"
        description="Kajian parenting akan muncul di sini."
      />
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {parenting.series.slice(0, 4).map((series) => (
        <SeriesCard key={series.id} series={series} />
      ))}
    </div>
  );
}

/* ================================================================
   Talk Show
   ================================================================ */

function TalkShowSection() {
  return (
    <Container className="py-4 sm:py-5">
      <SectionHeader title="Talk Show" moreHref="/kitab/talk-show" />
      <Suspense
        fallback={
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton aspect-[4/3] rounded-2xl" />
            ))}
          </div>
        }
      >
        <TalkShowGrid />
      </Suspense>
    </Container>
  );
}

async function TalkShowGrid() {
  const talkShow = await findPublishedSeriesTypeBySlug("talk-show");
  if (!talkShow || talkShow.series.length === 0) {
    return (
      <EmptyState
        title="Belum ada talk show"
        description="Talk show akan muncul di sini."
      />
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {talkShow.series.slice(0, 4).map((series) => (
        <SeriesCard key={series.id} series={series} />
      ))}
    </div>
  );
}

/* ================================================================
   Kategori — kartu ber-ikon dengan jumlah seri
   ================================================================ */

const CATEGORY_PALETTE = [
  "from-brand/25 via-brand/10 to-transparent",
  "from-emerald-500/25 via-emerald-500/10 to-transparent",
  "from-amber-500/25 via-amber-500/10 to-transparent",
  "from-sky-500/25 via-sky-500/10 to-transparent",
  "from-rose-500/25 via-rose-500/10 to-transparent",
  "from-violet-500/25 via-violet-500/10 to-transparent",
];

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  fiqih: Scale,
  adab: Sparkles,
  hadits: ScrollText,
  akhlak: HeartHandshake,
  "al-quran": BookOpen,
  aqidah: ShieldCheck,
  tafsir: BookMarked,
  sirah: Landmark,
  tauhid: Star,
};

function CategoriesSection() {
  return (
    <Container className="py-4 sm:py-5">
      <SectionHeader title="Kategori" moreHref="/explore" />
      <CategoriesGrid />
    </Container>
  );
}

async function CategoriesGrid() {
  const categories = await listPublishedCategories();
  if (categories.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
      {categories.slice(0, 8).map((category, index) => {
        const Icon = category.icon
          ? (CATEGORY_ICONS[category.icon] ?? CATEGORY_ICONS[category.slug] ?? FolderOpen)
          : (CATEGORY_ICONS[category.slug] ?? FolderOpen);
        return (
          <Link
            key={category.id}
            href={`/kategori/${category.slug}`}
            className={`group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-border bg-gradient-to-br p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-lg hover:shadow-brand/5 sm:p-4 ${CATEGORY_PALETTE[index % CATEGORY_PALETTE.length]}`}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/12 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{category.nama}</span>
              <span className="text-xs text-muted">
                {category.seriesCount > 0
                  ? `${category.seriesCount} seri`
                  : "Segera hadir"}
              </span>
            </span>
            <ChevronRight
              className="h-4 w-4 shrink-0 text-muted transition-all group-hover:translate-x-0.5 group-hover:text-brand"
              aria-hidden
            />
          </Link>
        );
      })}
    </div>
  );
}

/* ================================================================
   Home Page
   ================================================================ */

export default function HomePage() {
  return (
    <>
      <HeroSection search={<HomeSearch />} stats={<HomeStats />} />
      <LatestAudioSection />
      <Container className="py-4 sm:py-5">
        <Suspense>
          <ContinueLearning />
        </Suspense>
      </Container>
      <LearningPicksSection />
      <KitabSection />
      <LatestSeriesSection />
      <TematikSection />
      <ParentingSection />
      <TalkShowSection />
      <CategoriesSection />
    </>
  );
}
