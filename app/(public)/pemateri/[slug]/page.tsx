import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Mic } from "lucide-react";
import { absoluteUrl, buildBreadcrumbJsonLd, buildOpenGraph, buildTwitter, canonicalUrl } from "@/lib/seo";
import { findPublishedSpeakerBySlug } from "@/repositories/speaker-repository";
import { listPublishedSpeakerSlugs } from "@/repositories/speaker-repository";
import { Container } from "@/components/ui/container";
import { Heading, Text } from "@/components/ui/typography";
import { EmptyState } from "@/components/ui/empty-state";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { SeriesCard } from "@/components/shared/series-card";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await listPublishedSpeakerSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pemateri = await findPublishedSpeakerBySlug(slug);
  if (!pemateri) return {};

  const url = canonicalUrl(`/pemateri/${pemateri.slug}`);

  return {
    title: pemateri.nama,
    description:
      pemateri.bio ??
      `Kajian bersama ${pemateri.nama} di MSI Audio — ${pemateri.series.length} series tersedia.`,
    alternates: { canonical: url },
    openGraph: buildOpenGraph(
      {
        title: pemateri.nama,
        description: pemateri.bio ?? `${pemateri.series.length} series kajian di MSI Audio.`,
        type: "profile",
        url,
        images: pemateri.foto ? [{ url: absoluteUrl(pemateri.foto), alt: pemateri.nama }] : undefined,
      },
      pemateri.foto,
    ),
    twitter: buildTwitter(
      {
        title: pemateri.nama,
        images: pemateri.foto ? absoluteUrl(pemateri.foto) : undefined,
      },
      pemateri.foto,
    ),
  };
}

export default async function PemateriDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pemateri = await findPublishedSpeakerBySlug(slug);
  if (!pemateri) notFound();

  const seriesList = pemateri.series.map((s) => s.series);
  const personJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    name: pemateri.nama,
    description: pemateri.bio,
    image: pemateri.foto,
    url: canonicalUrl(`/pemateri/${pemateri.slug}`),
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { label: "Beranda", href: "/" },
    { label: "Pemateri", href: "/pemateri" },
    { label: pemateri.nama },
  ]);

  return (
    <Container size="wide" className="flex flex-col gap-8 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: personJsonLd }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }} />
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/" },
          { label: "Pemateri", href: "/pemateri" },
          { label: pemateri.nama },
        ]}
      />

      <div className="flex items-start gap-4">
        {pemateri.foto ? (
          <Image
            src={pemateri.foto}
            alt={pemateri.nama}
            width={80}
            height={80}
            className="h-20 w-20 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
            <Mic className="h-9 w-9" aria-hidden />
          </span>
        )}
        <div className="flex flex-col gap-2">
          <Heading as="h1">{pemateri.nama}</Heading>
          <Text variant="muted">{seriesList.length} series kajian</Text>
          {pemateri.bio && (
            <p className="max-w-2xl leading-relaxed text-foreground/80">{pemateri.bio}</p>
          )}
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <Heading as="h2">Series yang Dibawakan</Heading>
        {seriesList.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {seriesList.map((series) => (
              <SeriesCard key={series.id} series={series} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Belum ada series"
            description="Belum ada series yang dibawakan pemateri ini."
          />
        )}
      </section>
    </Container>
  );
}
