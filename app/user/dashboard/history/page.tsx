import type { Metadata } from "next";
import Link from "next/link";
import { History } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { Container } from "@/components/ui/container";
import { Heading, Text } from "@/components/ui/typography";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/shared/pagination";
import { DashboardSearch } from "@/features/user/dashboard/dashboard-search";
import { HistoryList } from "@/features/user/dashboard/history-list";
import { getUserHistory } from "@/repositories/dashboard-repository";

export const metadata: Metadata = { title: "Riwayat" };

const PER_PAGE = 20;

export default async function DashboardHistoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const user = await getCurrentUser();
  const result = await getUserHistory(user?.id ?? "", {
    search: q || undefined,
    page,
    perPage: PER_PAGE,
  });

  return (
    <Container className="flex flex-col gap-6 py-8">
      <div>
        <Heading as="h1" className="flex items-center gap-2">
          <History className="h-6 w-6 text-brand" aria-hidden />
          Riwayat
        </Heading>
        <Text variant="muted" className="mt-1">
          Semua audio yang pernah kamu putar
        </Text>
      </div>

      <DashboardSearch
        baseHref="/user/dashboard/history"
        defaultValue={q}
        placeholder="Cari riwayat berdasarkan judul atau series..."
      />

      {result.total === 0 ? (
        q ? (
          <EmptyState
            title="Tidak ada hasil ditemukan"
            description={`Tidak ada riwayat yang cocok dengan "${q}".`}
            action={
              <Button asChild variant="outline">
                <Link href="/user/dashboard/history">Reset pencarian</Link>
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={History}
            title="Belum ada riwayat mendengarkan"
            description="Audio yang kamu putar akan muncul di sini."
            action={
              <Button asChild>
                <Link href="/explore">Jelajahi Series</Link>
              </Button>
            }
          />
        )
      ) : (
        <>
          <p className="text-sm text-muted">
            {result.total} riwayat{result.total !== 1 ? "" : ""}
          </p>
          <HistoryList items={result.items} />
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            baseHref="/user/dashboard/history"
          />
        </>
      )}
    </Container>
  );
}
