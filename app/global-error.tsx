"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heading, Text } from "@/components/ui/typography";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="id">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
          <Heading as="h1">Terjadi kesalahan fatal</Heading>
          <Text variant="muted" className="max-w-sm">
            Maaf, aplikasi mengalami masalah. Silakan muat ulang halaman.
          </Text>
          <Button onClick={retry} className="mt-2">
            Coba Lagi
          </Button>
        </div>
      </body>
    </html>
  );
}
