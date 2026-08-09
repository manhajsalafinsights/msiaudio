"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heading, Text } from "@/components/ui/typography";

export default function AdminErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <Heading as="h1">Terjadi kesalahan</Heading>
      <Text variant="muted" className="max-w-sm">
        Maaf, ada masalah saat memuat halaman admin. Silakan coba lagi.
      </Text>
      <Button onClick={reset} className="mt-2">
        Coba Lagi
      </Button>
    </div>
  );
}
