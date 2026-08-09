import type { Metadata } from "next";
import { buildOpenGraph, buildTwitter, canonicalUrl } from "@/lib/seo";
import { listPublishedSpeakers } from "@/repositories/speaker-repository";
import { Container } from "@/components/ui/container";
import { Heading, Text } from "@/components/ui/typography";
import { EmptyState } from "@/components/ui/empty-state";
import { PemateriCard } from "@/components/shared/pemateri-card";
import { Breadcrumb } from "@/components/shared/breadcrumb";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Pemateri",
  description: "Kenali para ustadz dan pemateri kajian di MSI Audio beserta series yang mereka bawakan.",
  alternates: { canonical: canonicalUrl("/pemateri") },
  openGraph: buildOpenGraph({
    title: "Pemateri",
    description: "Kenali para ustadz dan pemateri kajian di MSI Audio beserta series yang mereka bawakan.",
    url: canonicalUrl("/pemateri"),
  }),
  twitter: buildTwitter({
    title: "Pemateri",
    description: "Kenali para ustadz dan pemateri kajian di MSI Audio beserta series yang mereka bawakan.",
  }),
};

export default async function PemateriListPage() {
  const pemateri = await listPublishedSpeakers();

  return (
    <Container size="wide" className="flex flex-col gap-8 py-8">
      <Breadcrumb items={[{ label: "Beranda", href: "/" }, { label: "Pemateri" }]} />

      <div className="flex flex-col gap-2">
        <Heading as="h1">Pemateri</Heading>
        <Text variant="muted" className="max-w-lg">
          Daftar ustadz dan pemateri yang membawakan kajian di MSI Audio.
        </Text>
      </div>

      {pemateri.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pemateri.map((p) => (
            <PemateriCard key={p.id} pemateri={p} />
          ))}
        </div>
      ) : (
        <EmptyState title="Belum ada pemateri" description="Profil pemateri akan segera hadir." />
      )}
    </Container>
  );
}
