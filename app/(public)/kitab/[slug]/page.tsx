import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookOpen } from "lucide-react";
import { buildBreadcrumbJsonLd, buildOpenGraph, buildTwitter, canonicalUrl } from "@/lib/seo";
import { findPublishedSeriesTypeBySlug } from "@/repositories/series-type-repository";
import { listPublishedSeriesTypeSlugs } from "@/repositories/series-type-repository";
import { Container } from "@/components/ui/container";
import { Heading, Text } from "@/components/ui/typography";
import { EmptyState } from "@/components/ui/empty-state";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { SeriesRow } from "@/components/shared/series-row";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await listPublishedSeriesTypeSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const kitab = await findPublishedSeriesTypeBySlug(slug);
  if (!kitab) return {};

  const url = canonicalUrl(`/kitab/${kitab.slug}`);

  return {
    title: kitab.nama,
    description:
      kitab.description ??
      `Kajian ${kitab.nama} di MSI Audio — ${kitab.series.length} series tersedia.`,
    alternates: { canonical: url },
    openGraph: buildOpenGraph({
      title: kitab.nama,
      description: kitab.description ?? `Kajian ${kitab.nama} di MSI Audio.`,
      type: "website",
      url,
    }),
    twitter: buildTwitter({
      title: kitab.nama,
      description: kitab.description ?? `Kajian ${kitab.nama} di MSI Audio.`,
    }),
  };
}

export default async function KitabDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const kitab = await findPublishedSeriesTypeBySlug(slug);
  if (!kitab) notFound();

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { label: "Beranda", href: "/" },
    { label: "Kitab", href: "/kitab" },
    { label: kitab.nama },
  ]);

  return (
    <Container size="wide" className="flex flex-col gap-8 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }} />
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/" },
          { label: "Kitab", href: "/kitab" },
          { label: kitab.nama },
        ]}
      />

      <div className="flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <BookOpen className="h-7 w-7" aria-hidden />
        </span>
        <div className="flex flex-col gap-2">
          <Heading as="h1">{kitab.nama}</Heading>
          <Text variant="muted">{kitab.series.length} series kajian</Text>
          {kitab.description && (
            <p className="max-w-2xl leading-relaxed text-foreground/80">{kitab.description}</p>
          )}
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <Heading as="h2">Series</Heading>
        {kitab.series.length > 0 ? (
          <ul className="[&>li]:mb-2 lg:columns-4 lg:gap-2 lg:[&>li]:break-inside-avoid">
            {kitab.series.map((series) => (
              <SeriesRow key={series.id} series={series} />
            ))}
          </ul>
        ) : (
          <EmptyState title="Belum ada series" description="Belum ada series pada kitab ini." />
        )}
      </section>
    </Container>
  );
}
