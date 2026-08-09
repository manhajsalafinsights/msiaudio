import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { buildBreadcrumbJsonLd, buildOpenGraph, buildTwitter, canonicalUrl } from "@/lib/seo";
import { findPublishedCategoryBySlug } from "@/repositories/category-repository";
import { listPublishedCategorySlugs } from "@/repositories/category-repository";
import { getFilteredAudioList } from "@/services/search-service";
import { Container } from "@/components/ui/container";
import { Heading, Text } from "@/components/ui/typography";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { SeriesCard } from "@/components/shared/series-card";
import { AudioRow } from "@/components/shared/audio-row";
import { AudioRowSkeleton } from "@/components/shared/audio-row-skeleton";
import { Pagination } from "@/components/shared/pagination";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await listPublishedCategorySlugs();
  return slugs.map((slug) => ({ slug }));
}

const AUDIO_PER_PAGE = 20;
const SERIES_PREVIEW = 6;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const kategori = await findPublishedCategoryBySlug(slug);
  if (!kategori) return {};

  const url = canonicalUrl(`/kategori/${kategori.slug}`);

  return {
    title: `Kategori ${kategori.nama}`,
    description: `Kumpulan kajian kategori ${kategori.nama} di MSI Audio — ${kategori.series.length} series tersedia.`,
    alternates: { canonical: url },
    openGraph: buildOpenGraph({
      title: `Kategori ${kategori.nama}`,
      description: `Kumpulan kajian kategori ${kategori.nama} di MSI Audio.`,
      type: "website",
      url,
    }),
    twitter: buildTwitter({
      title: `Kategori ${kategori.nama}`,
      description: `Kumpulan kajian kategori ${kategori.nama} di MSI Audio.`,
    }),
  };
}

async function AudioListSection({
  categoryId,
  categorySlug,
  page,
}: {
  categoryId: string;
  categorySlug: string;
  page: number;
}) {
  const result = await getFilteredAudioList(page, AUDIO_PER_PAGE, { categoryId });

  if (result.items.length === 0) {
    return (
      <EmptyState title="Belum ada audio" description="Belum ada audio pada kategori ini." />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col gap-2">
        {result.items.map((audio) => (
          <AudioRow key={audio.id} audio={audio} />
        ))}
      </ul>
      <Pagination
        page={page}
        totalPages={result.totalPages}
        baseHref={`/kategori/${categorySlug}`}
      />    </div>
  );
}

export default async function KategoriDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10) || 1);

  const kategori = await findPublishedCategoryBySlug(slug);
  if (!kategori) notFound();

  const seriesList = kategori.series.map((s) => s.series);

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { label: "Beranda", href: "/" },
    { label: "Kategori", href: "/kategori" },
    { label: kategori.nama },
  ]);

  return (
    <Container size="wide" className="flex flex-col gap-8 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }} />
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/" },
          { label: "Kategori", href: "/kategori" },
          { label: kategori.nama },
        ]}
      />

      <div className="flex flex-col gap-2">
        <Heading as="h1">{kategori.nama}</Heading>
        <Text variant="muted">{kategori.series.length} series kajian</Text>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Heading as="h2" className="text-xl md:text-2xl">
            Series
          </Heading>
          {kategori.series.length > SERIES_PREVIEW && (
            <Button asChild variant="ghost" size="sm">
              <Link href={`/series?kategori=${kategori.id}`}>Lihat Semua</Link>
            </Button>
          )}
        </div>
        {seriesList.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {seriesList.slice(0, SERIES_PREVIEW).map((series) => (
              <SeriesCard key={series.id} series={series} />
            ))}
          </div>
        ) : (
          <EmptyState title="Belum ada series" description="Belum ada series pada kategori ini." />
        )}
      </section>

      <section className="flex flex-col gap-4">
        <Heading as="h2" className="text-xl md:text-2xl">
          Audio
        </Heading>
        <Suspense
          fallback={
            <div className="flex flex-col gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <AudioRowSkeleton key={i} />
              ))}
            </div>
          }
        >
          <AudioListSection categoryId={kategori.id} categorySlug={kategori.slug} page={currentPage} />
        </Suspense>
      </section>
    </Container>
  );
}
