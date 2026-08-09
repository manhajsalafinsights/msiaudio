import type { Metadata } from "next";
import Link from "next/link";
import { buildOpenGraph, buildTwitter, canonicalUrl } from "@/lib/seo";
import { listPublishedCategories } from "@/repositories/category-repository";
import { Container } from "@/components/ui/container";
import { Heading, Text } from "@/components/ui/typography";
import { EmptyState } from "@/components/ui/empty-state";
import { Breadcrumb } from "@/components/shared/breadcrumb";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Kategori",
  description:
    "Jelajahi kajian berdasarkan kategori — Aqidah, Hadits, Fiqih, Akhlak, Tafsir, Sirah, dan lainnya.",
  alternates: { canonical: canonicalUrl("/kategori") },
  openGraph: buildOpenGraph({
    title: "Kategori",
    description:
      "Jelajahi kajian berdasarkan kategori — Aqidah, Hadits, Fiqih, Akhlak, Tafsir, Sirah, dan lainnya.",
    url: canonicalUrl("/kategori"),
  }),
  twitter: buildTwitter({
    title: "Kategori",
    description:
      "Jelajahi kajian berdasarkan kategori — Aqidah, Hadits, Fiqih, Akhlak, Tafsir, Sirah, dan lainnya.",
  }),
};

export default async function KategoriListPage() {
  const kategori = await listPublishedCategories();

  return (
    <Container size="wide" className="flex flex-col gap-8 py-8">
      <Breadcrumb items={[{ label: "Beranda", href: "/" }, { label: "Kategori" }]} />

      <div className="flex flex-col gap-2">
        <Heading as="h1">Kategori</Heading>
        <Text variant="muted" className="max-w-lg">
          Pilih kategori kajian yang sesuai minat Anda.
        </Text>
      </div>

      {kategori.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {kategori.map((c) => (
            <Link
              key={c.id}
              href={`/kategori/${c.slug}`}
              className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium transition-colors hover:border-brand/30 hover:text-brand"
            >
              {c.nama}
              <span className="ml-1.5 text-xs text-muted">{c.seriesCount} series</span>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState title="Belum ada kategori" description="Kategori kajian akan segera hadir." />
      )}
    </Container>
  );
}
