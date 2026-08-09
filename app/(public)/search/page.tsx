import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Mic, Search as SearchIcon } from "lucide-react";
import { getSearchGroups } from "@/services/search-service";
import { SearchInput } from "@/components/shared/search-input";
import { SeriesCard } from "@/components/shared/series-card";
import { AudioRow } from "@/components/shared/audio-row";
import { EmptyState } from "@/components/ui/empty-state";
import { Container } from "@/components/ui/container";
import { Heading, Text } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { formatCount } from "@/utils/format";

export const metadata: Metadata = {
  title: "Pencarian",
  robots: { index: false, follow: true },
};

function SearchForm({ defaultValue }: { defaultValue?: string }) {
  return (
    <form
      action="/search"
      method="get"
      role="search"
      aria-label="Cari di seluruh situs"
      className="w-full"
    >
      <SearchInput
        defaultValue={defaultValue}
        placeholder="Cari series, kitab, ustadz, audio..."
        className="w-full"
        autoFocus={!defaultValue}
      />
    </form>
  );
}

function KitabRow({ kitab }: { kitab: { id: string; nama: string; seriesCount: number } }) {
  return (
    <li>
      <Link
        href={`/explore?type=${kitab.id}`}
        className="group flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 transition-all hover:border-brand/20 hover:shadow-sm"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <BookOpen className="h-4 w-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium group-hover:text-brand">
            {kitab.nama}
          </span>
          <span className="block text-xs text-muted">{kitab.seriesCount} series</span>
        </span>
      </Link>
    </li>
  );
}

function SpeakerRow({
  speaker,
}: {
  speaker: { id: string; nama: string; slug: string; foto: string | null; bio: string | null };
}) {
  return (
    <li>
      <Link
        href={`/explore?ustadz=${speaker.id}`}
        className="group flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 transition-all hover:border-brand/20 hover:shadow-sm"
      >
        {speaker.foto ? (
          <Image
            src={speaker.foto}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-semibold text-brand">
            {speaker.nama.charAt(0)}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <Mic className="h-3.5 w-3.5 text-brand" aria-hidden />
            <span className="block truncate text-sm font-medium group-hover:text-brand">
              {speaker.nama}
            </span>
          </span>
          {speaker.bio && (
            <span className="block truncate text-xs text-muted">{speaker.bio}</span>
          )}
        </span>
      </Link>
    </li>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  if (!query) {
    return (
      <Container className="flex flex-col items-center gap-6 py-12">
        <Heading as="h1">Pencarian</Heading>
        <Text variant="muted" className="max-w-md text-center">
          Cari series, kitab, ustadz, atau audio favorit Anda.
        </Text>
        <div className="w-full max-w-lg">
          <SearchForm />
        </div>
        <Button asChild variant="link">
          <Link href="/explore">Jelajahi Semua Series</Link>
        </Button>
      </Container>
    );
  }

  const groups = await getSearchGroups(query);
  const hasResults =
    groups.series.length > 0 ||
    groups.kitab.length > 0 ||
    groups.audio.length > 0 ||
    groups.speakers.length > 0;

  return (
    <Container size="wide" className="flex flex-col gap-8 py-8">
      <div className="flex flex-col gap-4">
        <Heading as="h1">Pencarian</Heading>
        <div className="max-w-lg">
          <SearchForm defaultValue={query} />
        </div>
      </div>

      {!hasResults ? (
        <EmptyState
          title="Tidak ditemukan hasil untuk pencarian tersebut."
          description={`Coba kata kunci lain, misalnya judul kitab atau nama ustadz.`}
          action={
            <Button asChild>
              <Link href="/explore">Jelajahi Semua Series</Link>
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-10">
          <Text variant="muted">
            Hasil pencarian untuk: <span className="font-medium text-foreground">“{query}”</span>
          </Text>

          {groups.series.length > 0 && (
            <section aria-label="Hasil pencarian series" className="flex flex-col gap-4">
              <Heading as="h2" className="text-xl md:text-2xl">
                Series{" "}
                <span className="text-sm font-normal text-muted">
                  ({formatCount(groups.totalSeries)})
                </span>
              </Heading>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {groups.series.map((series) => (
                  <SeriesCard key={series.id} series={series} />
                ))}
              </div>
              {groups.totalSeries > groups.series.length && (
                <Button asChild variant="outline" size="sm" className="self-start">
                  <Link href={`/explore?q=${encodeURIComponent(query)}`}>
                    Lihat semua {formatCount(groups.totalSeries)} series
                  </Link>
                </Button>
              )}
            </section>
          )}

          {groups.kitab.length > 0 && (
            <section aria-label="Hasil pencarian kitab" className="flex flex-col gap-4">
              <Heading as="h2" className="text-xl md:text-2xl">
                Kitab{" "}
                <span className="text-sm font-normal text-muted">
                  ({formatCount(groups.totalKitab)})
                </span>
              </Heading>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {groups.kitab.map((k) => (
                  <KitabRow key={k.id} kitab={k} />
                ))}
              </ul>
            </section>
          )}

          {groups.audio.length > 0 && (
            <section aria-label="Hasil pencarian audio" className="flex flex-col gap-4">
              <Heading as="h2" className="text-xl md:text-2xl">
                Audio{" "}
                <span className="text-sm font-normal text-muted">
                  ({formatCount(groups.totalAudio)})
                </span>
              </Heading>
              <ul className="flex flex-col gap-2">
                {groups.audio.map((audio) => (
                  <AudioRow key={audio.id} audio={audio} />
                ))}
              </ul>
              {groups.totalAudio > groups.audio.length && (
                <Button asChild variant="outline" size="sm" className="self-start">
                  <Link href={`/explore?tab=audio&q=${encodeURIComponent(query)}`}>
                    Lihat semua {formatCount(groups.totalAudio)} audio
                  </Link>
                </Button>
              )}
            </section>
          )}

          {groups.speakers.length > 0 && (
            <section aria-label="Hasil pencarian pemateri" className="flex flex-col gap-4">
              <Heading as="h2" className="text-xl md:text-2xl">
                Pemateri{" "}
                <span className="text-sm font-normal text-muted">
                  ({formatCount(groups.totalSpeakers)})
                </span>
              </Heading>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {groups.speakers.map((s) => (
                  <SpeakerRow key={s.id} speaker={s} />
                ))}
              </ul>
            </section>
          )}

          <div className="flex items-center gap-2 text-sm text-muted">
            <SearchIcon className="h-4 w-4" aria-hidden />
            Tidak menemukan yang dicari?{" "}
            <Link href="/explore" className="font-medium text-brand hover:underline">
              Jelajahi Semua Series
            </Link>
          </div>
        </div>
      )}
    </Container>
  );
}
