import { cache } from "react";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";

/**
 * Include standar untuk konten publik series (tanpa data pribadi user).
 * Menghindari duplikasi definisi include antar repository/service.
 */
export const seriesPublicInclude = {
  seriesType: { select: { id: true, nama: true, slug: true } },
  speakers: {
    include: { speaker: { select: { id: true, nama: true, slug: true, foto: true } } },
    orderBy: { order: "asc" as const },
  },
  categories: {
    include: { category: { select: { id: true, nama: true, slug: true } } },
  },
} satisfies Prisma.SeriesInclude;

export type SeriesPublic = Prisma.SeriesGetPayload<{
  include: typeof seriesPublicInclude;
}>;

/** Series detail + audio published (urut nomorSesi) + media source utama. */
export const seriesDetailInclude = {
  ...seriesPublicInclude,
  audio: {
    where: { published: true },
    orderBy: { nomorSesi: "asc" as const },
    include: {
      mediaSources: { take: 1, select: { id: true, provider: true, url: true } },
    },
  },
} satisfies Prisma.SeriesInclude;

export type SeriesDetail = Prisma.SeriesGetPayload<{
  include: typeof seriesDetailInclude;
}>;

export async function listPublishedSeries(opts: {
  page: number;
  perPage: number;
  q?: string;
  categoryId?: string;
  speakerId?: string;
  seriesTypeId?: string;
  tagId?: string;
  sort?: "newest" | "oldest" | "title" | "title_desc" | "duration_asc" | "duration_desc" | "most_audio";
}) {
  const where: Prisma.SeriesWhereInput = { published: true };

  if (opts.q) {
    const q = opts.q.trim();
    where.OR = [
      { judul: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
      { deskripsi: { contains: q, mode: "insensitive" } },
      { seriesType: { nama: { contains: q, mode: "insensitive" } } },
      { speakers: { some: { speaker: { nama: { contains: q, mode: "insensitive" } } } } },
      { categories: { some: { category: { nama: { contains: q, mode: "insensitive" } } } } },
      { tags: { some: { tag: { nama: { contains: q, mode: "insensitive" } } } } },
    ];
  }
  if (opts.categoryId) {
    where.categories = { some: { categoryId: opts.categoryId } };
  }
  if (opts.seriesTypeId) {
    where.seriesTypeId = opts.seriesTypeId;
  }
  if (opts.speakerId) {
    where.speakers = { some: { speakerId: opts.speakerId } };
  }
  if (opts.tagId) {
    where.tags = { some: { tagId: opts.tagId } };
  }

  const sortMap: Record<string, Prisma.SeriesOrderByWithRelationInput> = {
    newest: { createdAt: "desc" },
    oldest: { createdAt: "asc" },
    title: { judul: "asc" },
    title_desc: { judul: "desc" },
    duration_asc: { totalDurasi: "asc" },
    duration_desc: { totalDurasi: "desc" },
    most_audio: { totalSesi: "desc" },
  };
  const orderBy = sortMap[opts.sort ?? "newest"] ?? sortMap.newest;

  const [total, items] = await prisma.$transaction([
    prisma.series.count({ where }),
    prisma.series.findMany({
      where,
      include: seriesPublicInclude,
      orderBy,
      skip: (opts.page - 1) * opts.perPage,
      take: opts.perPage,
    }),
  ]);

  return { items, total };
}

export async function listSeriesForExplore(limit: number) {
  return prisma.series.findMany({
    where: { published: true },
    include: seriesPublicInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/** Semua slug series published — untuk generateStaticParams. */
export async function listPublishedSeriesSlugs() {
  const rows = await prisma.series.findMany({
    where: { published: true },
    select: { slug: true },
  });
  return rows.map((row) => row.slug);
}

export const findPublishedSeriesBySlug = cache(async (slug: string): Promise<SeriesDetail | null> => {
  return prisma.series.findFirst({
    where: { slug, published: true },
    include: seriesDetailInclude,
  });
});

export function buildSeriesSearchWhere(q: string): Prisma.SeriesWhereInput {
  return {
    published: true,
    OR: [
      { judul: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
      { deskripsi: { contains: q, mode: "insensitive" } },
      { seriesType: { nama: { contains: q, mode: "insensitive" } } },
      { speakers: { some: { speaker: { nama: { contains: q, mode: "insensitive" } } } } },
      { categories: { some: { category: { nama: { contains: q, mode: "insensitive" } } } } },
      { tags: { some: { tag: { nama: { contains: q, mode: "insensitive" } } } } },
    ],
  };
}

/** Search published series — judul/slug/deskripsi + nama terkait (kitab, ustadz, kategori, tag). */
export async function searchPublishedSeries(opts: {
  q: string;
  limit?: number;
}): Promise<SeriesPublic[]> {
  const q = opts.q.trim();
  return prisma.series.findMany({
    where: buildSeriesSearchWhere(q),
    include: seriesPublicInclude,
    orderBy: { createdAt: "desc" },
    take: opts.limit ?? 20,
  });
}

export async function countPublishedSeries(q?: string) {
  return prisma.series.count({
    where: q?.trim() ? buildSeriesSearchWhere(q.trim()) : { published: true },
  });
}

/** Related series — same speaker OR same category (excluding self). */
export async function findRelatedSeries(opts: {
  seriesId: string;
  speakerIds: string[];
  categoryIds: string[];
  limit?: number;
}): Promise<SeriesPublic[]> {
  const where: Prisma.SeriesWhereInput = {
    published: true,
    id: { not: opts.seriesId },
    OR: [
      opts.speakerIds.length > 0
        ? { speakers: { some: { speakerId: { in: opts.speakerIds } } } }
        : {},
      opts.categoryIds.length > 0
        ? { categories: { some: { categoryId: { in: opts.categoryIds } } } }
        : {},
    ].filter((cond) => Object.keys(cond).length > 0) as Prisma.SeriesWhereInput[],
  };

  return prisma.series.findMany({
    where,
    include: seriesPublicInclude,
    orderBy: { createdAt: "desc" },
    take: opts.limit ?? 6,
  });
}

/* ================================================================
   ADMIN — manajemen konten
   ================================================================ */

export async function listSeriesAdmin(opts: {
  q?: string;
  page?: number;
  perPage?: number;
  status?: "PUBLISHED" | "DRAFT" | "ALL";
}) {
  const { q, page = 1, perPage = 10, status } = opts;
  const where: Prisma.SeriesWhereInput = {
    ...(q
      ? {
          OR: [
            { judul: { contains: q, mode: "insensitive" as const } },
            { slug: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(status === "PUBLISHED" ? { published: true } : {}),
    ...(status === "DRAFT" ? { published: false } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.series.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        seriesType: { select: { id: true, nama: true } },
        speakers: { select: { speaker: { select: { id: true, nama: true } } } },
        _count: { select: { audio: true } },
      },
    }),
    prisma.series.count({ where }),
  ]);

  return { items, total, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function getSeriesAdmin(id: string) {
  return prisma.series.findUnique({
    where: { id },
    include: {
      seriesType: { select: { id: true, nama: true } },
      speakers: { select: { speaker: { select: { id: true, nama: true, foto: true } }, order: true } },
      categories: { select: { category: { select: { id: true, nama: true } } } },
      tags: { select: { tag: { select: { id: true, nama: true } } } },
      _count: { select: { audio: true } },
    },
  });
}

export async function seriesSlugExists(slug: string, excludeId?: string) {
  const item = await prisma.series.findUnique({ where: { slug } });
  return Boolean(item && item.id !== excludeId);
}

/** Hitung ulang totalSesi & totalDurasi series dari data audio. */
export async function recalcSeriesTotals(seriesId: string) {
  const agg = await prisma.audio.aggregate({
    where: { seriesId },
    _count: true,
    _sum: { durasi: true },
  });
  return prisma.series.update({
    where: { id: seriesId },
    data: { totalSesi: agg._count, totalDurasi: agg._sum.durasi ?? 0 },
  });
}

export async function listAllSeries() {
  return prisma.series.findMany({
    select: { id: true, judul: true },
    orderBy: { judul: "asc" },
  });
}

export async function listPublishedSeriesOptions(limit = 500) {
  return prisma.series.findMany({
    where: { published: true },
    select: { id: true, judul: true },
    orderBy: { judul: "asc" },
    take: limit,
  });
}
