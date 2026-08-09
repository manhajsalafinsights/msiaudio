import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Heading, Text } from "@/components/ui/typography";

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <Text variant="muted" className="text-sm font-semibold uppercase tracking-widest">
        404
      </Text>
      <Heading as="h1">Halaman tidak ditemukan</Heading>
      <Text variant="muted" className="max-w-sm">
        Halaman yang Anda cari tidak ada, atau telah dipindahkan.
      </Text>
      <Button asChild className="mt-2">
        <Link href="/">Kembali ke Beranda</Link>
      </Button>
    </Container>
  );
}
