import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { site } from "@/lib/config/site";
import {
  absoluteUrl,
  buildOpenGraph,
  buildTwitter,
  canonicalUrl,
  OG_IMAGE_WIDTH,
  OG_IMAGE_HEIGHT,
} from "@/lib/seo";
import { NotFoundError } from "@/lib/errors/app-error";
import { getPlayerContext } from "@/features/player/services/player-service";
import { listRelatedAudio, listAudioBySameSpeaker } from "@/repositories/audio-repository";
import { getTranscriptByAudio } from "@/repositories/transcript-repository";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { PlayerFull } from "@/features/player/components/player-full";
import { PlayerErrorBoundary } from "@/features/player/components/error-boundary";
import { OfflineBanner } from "@/features/player/hooks/use-online-status";
import { PlayerProvider } from "@/features/player/context/player-provider";
import { RelatedAudioList } from "@/features/player/components/player-related";

export const revalidate = 60;
export const dynamicParams = true;

function buildJsonLd(audio: {
  id: string;
  judul: string;
  deskripsi: string | null;
  slug: string;
  cover: string | null;
  durasi: number;
  createdAt: Date;
  updatedAt: Date;
  nomorSesi: number;
  series: {
    id: string;
    judul: string;
    slug: string;
    cover: string | null;
    totalSesi: number;
    totalDurasi: number;
    seriesType: { nama: string };
    speakers: { speaker: { id: string; nama: string; slug: string; foto: string | null } }[];
  };
  mediaSources: { provider: string; url: string }[];
}) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "PodcastEpisode",
    name: audio.judul,
    description: audio.deskripsi,
    url: `${site.url}/audio/${audio.slug}`,
    image: audio.cover ?? audio.series.cover,
    datePublished: audio.createdAt.toISOString(),
    dateModified: audio.updatedAt.toISOString(),
    duration: `PT${audio.durasi}S`,
    episodeNumber: audio.nomorSesi,
    partOfSeason: {
      "@type": "PodcastSeason",
      name: audio.series.judul,
      url: `${site.url}/series/${audio.series.slug}`,
      image: audio.series.cover,
    },
    partOfSeries: {
      "@type": "PodcastSeries",
      name: audio.series.judul,
      url: `${site.url}/series/${audio.series.slug}`,
      containsSeason: {
        "@type": "ItemList",
        numberOfItems: audio.series.totalSesi,
      },
    },
    ...(audio.mediaSources[0]?.url
      ? {
          associatedMedia: {
            "@type": "MediaObject",
            contentUrl: audio.mediaSources[0].url,
            encodingFormat:
              audio.mediaSources[0].provider === "YOUTUBE" ? "video/youtube" : "audio/mpeg",
          },
        }
      : {}),
    ...(audio.series.speakers.length > 0
      ? {
          contributor: audio.series.speakers.map((s) => ({
            "@type": "Person",
            name: s.speaker.nama,
            url: `${site.url}/pemateri/${s.speaker.slug}`,
            image: s.speaker.foto,
          })),
        }
      : {}),
  });
}

function buildBreadcrumbJsonLd(audio: {
  slug: string;
  judul: string;
  series: { slug: string; judul: string };
}) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Beranda",
        item: site.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Series",
        item: `${site.url}/series`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: audio.series.judul,
        item: `${site.url}/series/${audio.series.slug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: audio.judul,
        item: `${site.url}/audio/${audio.slug}`,
      },
    ],
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { audio } = await getPlayerContext(slug);
    const speakerNames = audio.series.speakers.map((s) => s.speaker.nama).join(", ");
    const description =
      audio.deskripsi ??
      `Dengarkan ${audio.judul} (${speakerNames}) dari ${audio.series.judul}. Sesi ${audio.nomorSesi} dari ${audio.series.totalSesi}.`;

    const url = canonicalUrl(`/audio/${audio.slug}`);
    const ogImage = audio.cover ?? audio.series.cover;

    return {
      title: `${audio.judul} — ${audio.series.judul}`,
      description,
      alternates: { canonical: url },
      openGraph: buildOpenGraph(
        {
          title: `${audio.judul} — ${audio.series.judul}`,
          description,
          type: "article",
          url,
          images: ogImage
            ? [
                {
                  url: absoluteUrl(ogImage),
                  width: OG_IMAGE_WIDTH,
                  height: OG_IMAGE_HEIGHT,
                  alt: audio.judul,
                },
              ]
            : undefined,
        },
        ogImage,
      ),
      twitter: buildTwitter(
        {
          title: `${audio.judul} — ${audio.series.judul}`,
          description,
          images: ogImage ? absoluteUrl(ogImage) : undefined,
        },
        ogImage,
      ),
    };
  } catch {
    return {};
  }
}

export default async function AudioDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let playerContext;
  try {
    playerContext = await getPlayerContext(slug);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  const { audio, resolvedSource, queue } = playerContext;

  // Daftar sesi series; status listening (centang) diisi client-side via /api/listening
  // agar halaman bebas runtime API (headers) sehingga bisa di-cache via ISR.
  const sessions = queue
    .map(({ audio: item }) => ({
      id: item.id,
      slug: item.slug,
      number: item.nomorSesi,
      title: item.judul,
      duration: item.durasi,
      isCurrent: item.id === audio.id,
      isCompleted: false,
    }))
    .sort((a, b) => a.number - b.number);

  const speakerIds = audio.series.speakers.map((s) => s.speaker.id);
  const [seriesRelated, speakerRelated, transcript] = await Promise.all([
    listRelatedAudio(audio.series.id, audio.id, 4),
    speakerIds.length > 0
      ? listAudioBySameSpeaker(speakerIds, audio.series.id, 4)
      : Promise.resolve([]),
    getTranscriptByAudio(audio.id),
  ]);
  const relatedAudios = [
    ...seriesRelated,
    ...speakerRelated.filter((r) => !seriesRelated.some((s) => s.id === r.id)),
  ].slice(0, 6);

  const jsonLd = buildJsonLd(audio);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(audio);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }} />
      <Container size="wide" className="flex flex-col gap-8 py-6">
        <Breadcrumb
          items={[
            { label: "Beranda", href: "/" },
            { label: "Series", href: "/series" },
            { label: audio.series.judul, href: `/series/${audio.series.slug}` },
            { label: audio.judul },
          ]}
        />

        <div className="flex items-center justify-between gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/series/${audio.series.slug}`}>
              <ArrowLeft className="h-4 w-4" aria-hidden />
              {audio.series.judul}
            </Link>
          </Button>
          <Text variant="small" className="hidden">
            Sesi {audio.nomorSesi} dari {audio.series.totalSesi}
          </Text>
        </div>

        <PlayerErrorBoundary>
          <PlayerProvider
            autoInitialize
            elementId="yt-player-full"
            source={resolvedSource ?? undefined}
          >
            <OfflineBanner />
            <PlayerFull
              audio={audio}
              sessions={sessions}
              transcript={
                transcript?.segments?.length
                  ? { segments: transcript.segments, language: transcript.language }
                  : null
              }
            />
          </PlayerProvider>
        </PlayerErrorBoundary>

        {relatedAudios.length > 0 && (
          <RelatedAudioList title="Audio Terkait" audios={relatedAudios} />
        )}
      </Container>
    </>
  );
}
