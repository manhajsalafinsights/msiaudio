import { cache } from "react";
import { prisma } from "@/lib/prisma/client";
import { seriesPublicInclude } from "@/repositories/series-repository";

export async function listTags() {
  return prisma.tag.findMany({
    select: { id: true, nama: true, slug: true },
    orderBy: { nama: "asc" },
  });
}

export async function listTagsAdmin(opts: {
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
    prisma.tag.findMany({
      where,
      orderBy: { nama: "asc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: { _count: { select: { series: true } } },
    }),
    prisma.tag.count({ where }),
  ]);

  return { items, total, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function getTagById(id: string) {
  return prisma.tag.findUnique({ where: { id } });
}

export async function tagSlugExists(slug: string, excludeId?: string) {
  const item = await prisma.tag.findUnique({ where: { slug } });
  return Boolean(item && item.id !== excludeId);
}

/* ================================================================
   PUBLIK (Phase 11 — Explore & Discovery)
   ================================================================ */

/** Tag yang dipakai ≥1 series published + jumlah series-nya. */
export async function listPublishedTags() {
  return prisma.tag.findMany({
    where: { series: { some: { series: { published: true } } } },
    select: {
      id: true,
      nama: true,
      slug: true,
      _count: { select: { series: { where: { series: { published: true } } } } },
    },
    orderBy: { nama: "asc" },
  });
}

/** Semua slug tag dengan series published — untuk generateStaticParams. */
export async function listPublishedTagSlugs() {
  const rows = await prisma.tag.findMany({
    where: { series: { some: { series: { published: true } } } },
    select: { slug: true },
  });
  return rows.map((row) => row.slug);
}

/** Detail tag + series published — untuk /tag/[slug]. */
export const findPublishedTagBySlug = cache(async (slug: string) => {
  return prisma.tag.findFirst({
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
