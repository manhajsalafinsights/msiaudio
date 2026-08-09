import type { Metadata } from "next";
import { buildOpenGraph, buildTwitter, canonicalUrl } from "@/lib/seo";
import { listPublishedSeriesTypes } from "@/repositories/series-type-repository";
import { Container } from "@/components/ui/container";
import { Heading, Text } from "@/components/ui/typography";
import { EmptyState } from "@/components/ui/empty-state";
import { KitabCard } from "@/components/shared/kitab-card";
import { Breadcrumb } from "@/components/shared/breadcrumb";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Kitab",
  description: "Jelajahi seluruh kitab yang dikaji di MSI Audio — dari akidah, fiqih, hingga adab.",
  alternates: { canonical: canonicalUrl("/kitab") },
  openGraph: buildOpenGraph({
    title: "Kitab",
    description: "Jelajahi seluruh kitab yang dikaji di MSI Audio — dari akidah, fiqih, hingga adab.",
    url: canonicalUrl("/kitab"),
  }),
  twitter: buildTwitter({
    title: "Kitab",
    description: "Jelajahi seluruh kitab yang dikaji di MSI Audio — dari akidah, fiqih, hingga adab.",
  }),
};

export default async function KitabListPage() {
  const kitab = await listPublishedSeriesTypes();

  return (
    <Container size="wide" className="flex flex-col gap-8 py-8">
      <Breadcrumb items={[{ label: "Beranda", href: "/" }, { label: "Kitab" }]} />

      <div className="flex flex-col gap-2">
        <Heading as="h1">Kitab</Heading>
        <Text variant="muted" className="max-w-lg">
          Daftar kitab yang dikaji dalam bentuk series — pilih kitab untuk melihat kajiannya.
        </Text>
      </div>

      {kitab.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {kitab.map((k) => (
            <KitabCard key={k.id} kitab={k} />
          ))}
        </div>
      ) : (
        <EmptyState title="Belum ada kitab" description="Kajian kitab akan segera hadir." />
      )}
    </Container>
  );
}
