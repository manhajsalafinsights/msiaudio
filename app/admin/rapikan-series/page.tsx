import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { suggestSeriesTypeSlug } from "@/features/admin/lib/series-type-detect";
import { SeriesTypeTidy } from "@/features/admin/series/components/series-type-tidy";

export const metadata = { title: "Rapikan Series — Admin" };

export default async function AdminTidySeriesPage() {
  await requireAdmin();

  const [types, series] = await Promise.all([
    prisma.seriesType.findMany({
      orderBy: { nama: "asc" },
      select: { id: true, nama: true, slug: true },
    }),
    prisma.series.findMany({
      orderBy: [{ seriesType: { nama: "asc" } }, { judul: "asc" }],
      select: {
        id: true,
        judul: true,
        createdAt: true,
        seriesTypeId: true,
        seriesType: { select: { nama: true } },
      },
    }),
  ]);

  const typeBySlug = new Map(types.map((t) => [t.slug, t.id]));

  const rows = series.map((s) => {
    const suggestedSlug = suggestSeriesTypeSlug(s.judul);
    return {
      id: s.id,
      judul: s.judul,
      currentTypeId: s.seriesTypeId,
      currentTypeName: s.seriesType?.nama ?? "Tanpa Tipe",
      suggestedTypeId: suggestedSlug ? (typeBySlug.get(suggestedSlug) ?? null) : null,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold">Rapikan Series</h1>
        <p className="mt-1 text-sm text-muted">
          Saran tipe dihitung dari judul (kitab / tematik / bahasa arab / muslimah). Setelah
          diterapkan, series langsung pindah ke tipe yang sesuai.
        </p>
      </div>
      <SeriesTypeTidy types={types.map((t) => ({ id: t.id, nama: t.nama }))} rows={rows} />
    </div>
  );
}