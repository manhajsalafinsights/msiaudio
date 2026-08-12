import { cache } from "react";
import { prisma } from "@/lib/prisma/client";
import { seriesPublicInclude } from "@/repositories/series-repository";

export async function listSeriesTypes() {
  return prisma.seriesType.findMany({
    select: { id: true, nama: true, slug: true },
    orderBy: { nama: "asc" },
  });
}

export async function listSeriesTypesAdmin(opts: { q?: string; page?: number; perPage?: number }) {
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
    prisma.seriesType.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: { _count: { select: { series: true } } },
    }),
    prisma.seriesType.count({ where }),
  ]);

  return { items, total, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function getSeriesTypeById(id: string) {
  return prisma.seriesType.findUnique({ where: { id } });
}

export async function seriesTypeSlugExists(slug: string, excludeId?: string) {
  const item = await prisma.seriesType.findUnique({ where: { slug } });
  return Boolean(item && item.id !== excludeId);
}

/** Search kitab (SeriesType) — hanya tipe yang punya series published (dengan audio). */
export async function searchSeriesTypes(q: string, limit = 20) {
  const query = q.trim();
  return prisma.seriesType.findMany({
    where: {
      nama: { contains: query, mode: "insensitive" },
      series: { some: { published: true, audio: { some: { published: true } } } },
    },
    include: { _count: { select: { series: true } } },
    orderBy: { nama: "asc" },
    take: limit,
  });
}

export async function countSearchSeriesTypes(q: string) {
  return prisma.seriesType.count({
    where: {
      nama: { contains: q.trim(), mode: "insensitive" },
      series: { some: { published: true, audio: { some: { published: true } } } },
    },
  });
}

/* ================================================================
   PUBLIK (Phase 11 — Explore & Discovery)
   ================================================================ */

export type SeriesTypePublic = {
  id: string;
  nama: string;
  slug: string;
  icon: string | null;
  description: string | null;
  seriesCount: number;
  viewCount: number;
};

/** Kitab (SeriesType) yang punya ≥1 series published (dengan audio) — untuk /kitab & Pilihan Kitab.
 *  Hanya tipe isKitab (kajian berbasis kitab) yang tampil; tematik & lainnya tidak. */
export async function listPublishedSeriesTypes(): Promise<SeriesTypePublic[]> {
  const rows = await prisma.seriesType.findMany({
    where: {
      isKitab: true,
      series: { some: { published: true, audio: { some: { published: true } } } },
    },
    select: {
      id: true,
      nama: true,
      slug: true,
      icon: true,
      description: true,
      viewCount: true,
      _count: {
        select: {
          series: { where: { published: true, audio: { some: { published: true } } } },
        },
      },
    },
    orderBy: { nama: "asc" },
  });
  return rows.map((row) => ({
    id: row.id,
    nama: row.nama,
    slug: row.slug,
    icon: row.icon,
    description: row.description,
    seriesCount: row._count.series,
    viewCount: row.viewCount,
  }));
}

/** Semua slug kitab dengan series published (dengan audio) — untuk generateStaticParams. */
export async function listPublishedSeriesTypeSlugs() {
  const rows = await prisma.seriesType.findMany({
    where: { series: { some: { published: true, audio: { some: { published: true } } } } },
    select: { slug: true },
  });
  return rows.map((row) => row.slug);
}

/** Detail kitab + series published (dengan audio) — untuk /kitab/[slug]. */
export const findPublishedSeriesTypeBySlug = cache(async (slug: string) => {
  return prisma.seriesType.findFirst({
    where: { slug, series: { some: { published: true, audio: { some: { published: true } } } } },
    include: {
      series: {
        where: { published: true, audio: { some: { published: true } } },
        include: seriesPublicInclude,
        orderBy: { createdAt: "desc" },
      },
    },
  });
});
