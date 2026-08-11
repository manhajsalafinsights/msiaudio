import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookOpen } from "lucide-react";
import { buildBreadcrumbJsonLd, buildOpenGraph, buildTwitter, canonicalUrl } from "@/lib/seo";
import { findPublishedSeriesTypeBySlug } from "@/repositories/series-type-repository";
import { Container } from "@/components/ui/container";
import { Heading, Text } from "@/components/ui/typography";
import { EmptyState } from "@/components/ui/empty-state";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { SeriesCard } from "@/components/shared/series-card";

export const revalidate = 60;
export const dynamicParams = true;

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

export default async function KitabDetailPage({ params }: { params: Promise<{ slug: string }> }) {
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
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {kitab.series.map((series) => (
              <SeriesCard key={series.id} series={series} />
            ))}
          </div>
        ) : (
          <EmptyState title="Belum ada series" description="Belum ada series pada kitab ini." />
        )}
      </section>
    </Container>
  );
}
