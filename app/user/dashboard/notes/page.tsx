import type { Metadata } from "next";
import Link from "next/link";
import { StickyNote } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { Container } from "@/components/ui/container";
import { Heading, Text } from "@/components/ui/typography";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/shared/pagination";
import { DashboardSearch } from "@/features/user/dashboard/dashboard-search";
import { DashboardNotesList } from "@/features/user/dashboard/notes-list";
import { getUserNotesPage } from "@/repositories/dashboard-repository";

export const metadata: Metadata = { title: "Catatan" };

const PER_PAGE = 20;

export default async function DashboardNotesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const user = await getCurrentUser();
  const result = await getUserNotesPage(user?.id ?? "", {
    search: q || undefined,
    page,
    perPage: PER_PAGE,
  });

  return (
    <Container className="flex flex-col gap-6 py-8">
      <div>
        <Heading as="h1" className="flex items-center gap-2">
          <StickyNote className="h-6 w-6 text-brand" aria-hidden />
          Catatan
        </Heading>
        <Text variant="muted" className="mt-1">
          Catatan pribadimu sambil mendengarkan kajian
        </Text>
      </div>

      <DashboardSearch
        baseHref="/user/dashboard/notes"
        defaultValue={q}
        placeholder="Cari catatan berdasarkan isi, judul audio, atau series..."
      />

      {result.total === 0 ? (
        q ? (
          <EmptyState
            title="Tidak ada hasil ditemukan"
            description={`Tidak ada catatan yang cocok dengan "${q}".`}
            action={
              <Button asChild variant="outline">
                <Link href="/user/dashboard/notes">Reset pencarian</Link>
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={StickyNote}
            title="Belum ada catatan"
            description="Buka halaman audio dan gunakan tombol Catatan untuk mencatat."
            action={
              <Button asChild>
                <Link href="/explore">Jelajahi Series</Link>
              </Button>
            }
          />
        )
      ) : (
        <>
          <p className="text-sm text-muted">{result.total} catatan</p>
          <DashboardNotesList items={result.items} />
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            baseHref="/user/dashboard/notes"
          />
        </>
      )}
    </Container>
  );
}
