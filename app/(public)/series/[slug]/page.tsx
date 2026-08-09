import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, ListMusic, BookOpen } from "lucide-react";
import { formatDurationHuman } from "@/utils/duration";
import { site } from "@/lib/config/site";
import { absoluteUrl, buildBreadcrumbJsonLd, buildOpenGraph, buildTwitter, canonicalUrl, OG_IMAGE_WIDTH, OG_IMAGE_HEIGHT } from "@/lib/seo";
import { NotFoundError } from "@/lib/errors/app-error";
import { getSeriesBySlug } from "@/services/series-service";
import { getRelatedSeries } from "@/services/series-service";
import { getSeriesAudioList } from "@/services/audio-service";
import { listPublishedSeriesSlugs } from "@/repositories/series-repository";
import { getProgress } from "@/repositories/progress-repository";
import { getListeningByAudioIds } from "@/repositories/progress-repository";
import { getCurrentUser } from "@/lib/auth/session";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Heading, Text } from "@/components/ui/typography";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { Cover } from "@/components/shared/cover";
import { SessionRow } from "@/components/shared/session-row";
import { SeriesCard } from "@/components/shared/series-card";
import { EmptyState } from "@/components/ui/empty-state";
import { FavoriteButton } from "@/features/favorite/favorite-button";

export const revalidate = 60;
export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await listPublishedSeriesSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const series = await getSeriesBySlug(slug);
    const speakerNames = series.speakers.map((s) => s.speaker.nama).join(", ");
    const description =
      series.deskripsi ?? `Ikuti kajian ${series.judul} dari ${speakerNames ?? site.name}.`;

    const url = canonicalUrl(`/series/${series.slug}`);

    return {
      title: series.judul,
      description,
      alternates: { canonical: url },
      openGraph: buildOpenGraph(
        {
          title: series.judul,
          description,
          type: "website",
          url,
          images: series.cover
            ? [{ url: absoluteUrl(series.cover), width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT, alt: series.judul }]
            : undefined,
        },
        series.cover,
      ),
      twitter: buildTwitter(
        {
          title: series.judul,
          description,
          images: series.cover ? absoluteUrl(series.cover) : undefined,
        },
        series.cover,
      ),
    };
  } catch {
    return {};
  }
}

function buildJsonLd(series: {
  judul: string;
  deskripsi: string | null;
  slug: string;
  cover: string | null;
  totalSesi: number;
  totalDurasi: number;
  createdAt: Date;
  updatedAt: Date;
  seriesType: { nama: string };
  speakers: { speaker: { nama: string; slug: string; foto: string | null } }[];
  categories: { category: { nama: string } }[];
}) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: series.judul,
    description: series.deskripsi,
    url: `${site.url}/series/${series.slug}`,
    image: series.cover,
    dateCreated: series.createdAt.toISOString(),
    dateModified: series.updatedAt.toISOString(),
    hasPart: {
      "@type": "AudioObject",
      name: series.judul,
      description: series.deskripsi,
      duration: series.totalDurasi,
      hasPart: { "@type": "ItemList", numberOfItems: series.totalSesi },
    },
    creator: series.speakers.map((s) => ({
      "@type": "Person",
      name: s.speaker.nama,
      url: `${site.url}/pemateri/${s.speaker.slug}`,
      image: s.speaker.foto,
    })),
    about: series.categories.map((c) => c.category.nama),
    genre: series.seriesType.nama,
  });
}

export default async function SeriesDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let series;
  try {
    series = await getSeriesBySlug(slug);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  const [audioList, relatedSeries, user] = await Promise.all([
    getSeriesAudioList(series.id),
    getRelatedSeries(
      {
        id: series.id,
        speakers: series.speakers,
        categories: series.categories,
      },
      6,
    ),
    getCurrentUser(),
  ]);

  const seriesProgress = user ? await getProgress(user.id, series.id) : null;
  const listeningMap = new Map<string, { completed: boolean; progressPercent: number }>();
  if (user && audioList.length > 0) {
    const rows = await getListeningByAudioIds(
      user.id,
      audioList.map((a) => a.id),
    );
    for (const row of rows) {
      listeningMap.set(row.audioId, row);
    }
  }

  const speakerNames = series.speakers.map((s) => s.speaker.nama).join(", ");
  const jsonLd = buildJsonLd(series);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { label: "Beranda", href: "/" },
    { label: "Series", href: "/series" },
    { label: series.judul },
  ]);
  const progressPercent = seriesProgress ? Math.round(seriesProgress.progressPercent) : 0;
  const lastAudio = seriesProgress?.lastAudioId
    ? audioList.find((a) => a.id === seriesProgress.lastAudioId)
    : null;
  const primaryCta = seriesProgress && progressPercent > 0 && progressPercent < 100 && lastAudio
    ? { href: `/audio/${lastAudio.slug}`, label: `Lanjutkan Sesi ${lastAudio.nomorSesi}` }
    : { href: audioList[0] ? `/audio/${audioList[0].slug}` : "#", label: "Mulai dari Awal" };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }} />
      <Container className="flex flex-col gap-8 py-8">
        <Breadcrumb
          items={[
            { label: "Beranda", href: "/" },
            { label: "Series", href: "/series" },
            { label: series.judul },
          ]}
        />

        <div className="grid gap-8 md:grid-cols-[280px_1fr]">
          <Cover
            src={series.cover}
            alt={series.judul}
            variant="square"
            className="w-full max-w-[280px]"
          />

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                <Link
                  href={`/kitab/${series.seriesType.slug}`}
                  className="inline-flex items-center gap-1.5 hover:text-brand"
                >
                  <BookOpen className="h-3 w-3" aria-hidden />
                  {series.seriesType.nama}
                </Link>
              </Badge>
              {series.categories.map((c) => (
                <Badge key={c.category.id} variant="outline">
                  <Link href={`/kategori/${c.category.slug}`}>{c.category.nama}</Link>
                </Badge>
              ))}
            </div>

            <Heading as="h1">{series.judul}</Heading>

            {speakerNames && (
              <Text variant="muted">
                {series.speakers.map((s, i) => (
                  <span key={s.speaker.id}>
                    {i > 0 && " · "}
                    <Link href={`/pemateri/${s.speaker.slug}`} className="hover:text-brand">
                      {s.speaker.nama}
                    </Link>
                  </span>
                ))}
              </Text>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
              <span className="inline-flex items-center gap-1.5">
                <ListMusic className="h-4 w-4" aria-hidden />
                {series.totalSesi} sesi
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" aria-hidden />
                {formatDurationHuman(series.totalDurasi)}
              </span>
            </div>

            {seriesProgress && progressPercent > 0 && (
              <div className="flex max-w-md flex-col gap-2 rounded-xl border border-border bg-surface p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">Progress Anda</span>
                  <span className="text-brand">
                    {progressPercent}% selesai · {seriesProgress.completedCount} /{" "}
                    {series.totalSesi} sesi
                  </span>
                </div>
                <ProgressBar value={progressPercent} />
              </div>
            )}

            {series.deskripsi && (
              <p className="max-w-2xl leading-relaxed text-foreground/80">{series.deskripsi}</p>
            )}

            <div className="flex flex-wrap gap-3">
              <Button asChild disabled={!audioList.length}>
                <Link href={primaryCta.href}>
                  {audioList.length > 0 ? primaryCta.label : "Belum ada sesi"}
                </Link>
              </Button>
              <FavoriteButton seriesId={series.id} />
            </div>
          </div>
        </div>

        <section className="flex flex-col gap-4">
          <Heading as="h2">Daftar Sesi</Heading>
          {audioList.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {audioList.map((audio) => {
                const listening = listeningMap.get(audio.id);
                return (
                  <SessionRow
                    key={audio.id}
                    audio={audio}
                    nomor={audio.nomorSesi}
                    completed={listening?.completed}
                    progressPercent={listening?.progressPercent}
                  />
                );
              })}
            </ul>
          ) : (
            <EmptyState
              title="Belum ada sesi"
              description="Series ini belum memiliki sesi audio yang dipublikasikan."
            />
          )}
        </section>

        {relatedSeries.length > 0 && (
          <section className="flex flex-col gap-6">
            <Heading as="h2">Series Terkait</Heading>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedSeries.map((related) => (
                <SeriesCard key={related.id} series={related} />
              ))}
            </div>
          </section>
        )}
      </Container>
    </>
  );
}
