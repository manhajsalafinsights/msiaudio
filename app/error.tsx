"use client";

import Link from "next/link";
import { AlertCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Heading, Text } from "@/components/ui/typography";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="h-8 w-8" />
      </div>
      <Heading as="h1" className="text-2xl">
        Terjadi Kesalahan
      </Heading>
      <Text variant="muted" className="max-w-md">
        Maaf, terjadi kesalahan pada server. Halaman yang Anda cari tidak dapat diproses saat ini.
      </Text>
      <div className="flex gap-3">
        <Button onClick={() => reset()}>Coba Lagi</Button>
        <Button asChild variant="outline">
          <Link href="/">
            <Home className="h-4 w-4" />
            Beranda
          </Link>
        </Button>
      </div>
    </Container>
  );
}
