import { cache } from "react";
import { prisma } from "@/lib/prisma/client";
import { seriesPublicInclude } from "@/repositories/series-repository";

export async function listCategories() {
  return prisma.category.findMany({
    select: { id: true, nama: true, slug: true, icon: true },
    orderBy: { nama: "asc" },
  });
}

export async function listCategoriesAdmin(opts: {
  q?: string;
  page?: number;
  perPage?: number;
}) {
  const { q, page = 1, perPage = 10 } = opts;
  const where = q
    ? {
        OR: [
          { nama: { contains: q, mode: "insensitive" as const } },
          { slug: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.category.findMany({
      where,
      orderBy: { nama: "asc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: { _count: { select: { series: true } } },
    }),
    prisma.category.count({ where }),
  ]);

  return { items, total, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function getCategoryById(id: string) {
  return prisma.category.findUnique({ where: { id } });
}

export async function categorySlugExists(slug: string, excludeId?: string) {
  const item = await prisma.category.findUnique({ where: { slug } });
  return Boolean(item && item.id !== excludeId);
}

/* ================================================================
   PUBLIK (Phase 11 — Explore & Discovery)
   ================================================================ */

export type CategoryPublic = {
  id: string;
  nama: string;
  slug: string;
  icon: string | null;
  seriesCount: number;
};

/** Kategori yang dipakai ≥1 series published — untuk /kategori. */
export async function listPublishedCategories(): Promise<CategoryPublic[]> {
  const rows = await prisma.category.findMany({
    where: { series: { some: { series: { published: true } } } },
    select: {
      id: true,
      nama: true,
      slug: true,
      icon: true,
      _count: { select: { series: { where: { series: { published: true } } } } },
    },
    orderBy: { nama: "asc" },
  });
  return rows.map((row) => ({
    id: row.id,
    nama: row.nama,
    slug: row.slug,
    icon: row.icon,
    seriesCount: row._count.series,
  }));
}

/** Semua slug kategori dengan series published — untuk generateStaticParams. */
export async function listPublishedCategorySlugs() {
  const rows = await prisma.category.findMany({
    where: { series: { some: { series: { published: true } } } },
    select: { slug: true },
  });
  return rows.map((row) => row.slug);
}

/** Detail kategori + series published — untuk /kategori/[slug]. */
export const findPublishedCategoryBySlug = cache(async (slug: string) => {
  return prisma.category.findFirst({
    where: { slug, series: { some: { series: { published: true } } } },
    include: {
      series: {
        where: { series: { published: true } },
        include: { series: { include: seriesPublicInclude } },
        orderBy: { series: { createdAt: "desc" } },
      },
    },
  });
});
