import type { Metadata } from "next";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { Container } from "@/components/ui/container";
import { Heading, Text } from "@/components/ui/typography";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/shared/pagination";
import { DashboardSearch } from "@/features/user/dashboard/dashboard-search";
import { DashboardBookmarksList } from "@/features/user/dashboard/bookmarks-list";
import { getUserBookmarksPage } from "@/repositories/dashboard-repository";

export const metadata: Metadata = { title: "Bookmark" };

const PER_PAGE = 20;

export default async function DashboardBookmarksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const user = await getCurrentUser();
  const result = await getUserBookmarksPage(user?.id ?? "", {
    search: q || undefined,
    page,
    perPage: PER_PAGE,
  });

  return (
    <Container className="flex flex-col gap-6 py-8">
      <div>
        <Heading as="h1" className="flex items-center gap-2">
          <Bookmark className="h-6 w-6 text-brand" aria-hidden />
          Bookmark
        </Heading>
        <Text variant="muted" className="mt-1">
          Audio kajian yang kamu simpan untuk diakses kembali
        </Text>
      </div>

      <DashboardSearch
        baseHref="/user/dashboard/bookmarks"
        defaultValue={q}
        placeholder="Cari bookmark berdasarkan judul atau series..."
      />

      {result.total === 0 ? (
        q ? (
          <EmptyState
            title="Tidak ada hasil ditemukan"
            description={`Tidak ada bookmark yang cocok dengan "${q}".`}
            action={
              <Button asChild variant="outline">
                <Link href="/user/dashboard/bookmarks">Reset pencarian</Link>
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={Bookmark}
            title="Belum ada bookmark"
            description="Klik tombol bookmark di halaman audio untuk menyimpannya di sini."
            action={
              <Button asChild>
                <Link href="/explore">Jelajahi Series</Link>
              </Button>
            }
          />
        )
      ) : (
        <>
          <p className="text-sm text-muted">{result.total} bookmark</p>
          <DashboardBookmarksList items={result.items} />
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            baseHref="/user/dashboard/bookmarks"
          />
        </>
      )}
    </Container>
  );
}
