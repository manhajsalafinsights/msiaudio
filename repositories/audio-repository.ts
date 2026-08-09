import { cache } from "react";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";

/** Audio publik + series induk (untuk kartu/krumb) + media source utama. */
export const audioCardInclude = {
  series: {
    select: {
      id: true,
      judul: true,
      slug: true,
      cover: true,
      totalSesi: true,
      totalDurasi: true,
      seriesType: { select: { id: true, nama: true, slug: true } },
      speakers: {
        include: { speaker: { select: { id: true, nama: true, slug: true, foto: true } } },
        orderBy: { order: "asc" as const },
      },
    },
  },
  mediaSources: { take: 1, select: { id: true, provider: true, url: true, providerId: true } },
} satisfies Prisma.AudioInclude;

export type AudioCard = Prisma.AudioGetPayload<{ include: typeof audioCardInclude }>;

/** Audio detail (halaman pemutar): series + speaker + materi posisi-waktu. */
export const audioDetailInclude = {
  series: {
    select: {
      id: true,
      judul: true,
      slug: true,
      cover: true,
      totalSesi: true,
      totalDurasi: true,
      seriesType: { select: { id: true, nama: true, slug: true } },
      speakers: {
        include: { speaker: { select: { id: true, nama: true, slug: true, foto: true } } },
        orderBy: { order: "asc" as const },
      },
    },
  },
  mediaSources: { take: 1 },
  chapters: { orderBy: { startSecond: "asc" as const } },
  highlights: { orderBy: { startSecond: "asc" as const } },
  references: { orderBy: { startSecond: "asc" as const } },
} satisfies Prisma.AudioInclude;

export type AudioDetail = Prisma.AudioGetPayload<{ include: typeof audioDetailInclude }>;

export const findPublishedAudioBySlug = cache(async (slug: string): Promise<AudioDetail | null> => {
  return prisma.audio.findFirst({
    where: { slug, published: true },
    include: audioDetailInclude,
  });
});

/** Daftar audio published dalam satu series (urut sesi) — untuk panel "Sesi". */
export async function listPublishedAudioBySeries(seriesId: string) {
  return prisma.audio.findMany({
    where: { seriesId, published: true },
    include: audioCardInclude,
    orderBy: { nomorSesi: "asc" },
  });
}

/** Audio published terbaru lintas series (Home → "Kajian Terbaru"). */
export async function listRecentPublishedAudio(limit: number) {
  return prisma.audio.findMany({
    where: { published: true },
    include: audioCardInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/** Semua slug audio published — untuk generateStaticParams. */
export async function listPublishedAudioSlugs() {
  const rows = await prisma.audio.findMany({
    where: { published: true },
    select: { slug: true },
  });
  return rows.map((row) => row.slug);
}

/** Search published audio by judul or slug (LIKE, case-insensitive). */
export async function searchPublishedAudio(q: string, limit = 20): Promise<AudioCard[]> {
  return prisma.audio.findMany({
    where: {
      published: true,
      OR: [
        { judul: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
      ],
    },
    include: audioCardInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Audio sebelumnya/diaggu dalam satu series (berdasarkan nomorSesi).
 * Digunakan untuk navigasi prev/next.
 */
export async function findAdjacentAudio(
  seriesId: string,
  currentNomorSesi: number,
): Promise<{ prev: AudioCard | null; next: AudioCard | null }> {
  const [prev, next] = await Promise.all([
    prisma.audio.findFirst({
      where: { seriesId, published: true, nomorSesi: { lt: currentNomorSesi } },
      include: audioCardInclude,
      orderBy: { nomorSesi: "desc" },
      take: 1,
    }),
    prisma.audio.findFirst({
      where: { seriesId, published: true, nomorSesi: { gt: currentNomorSesi } },
      include: audioCardInclude,
      orderBy: { nomorSesi: "asc" },
      take: 1,
    }),
  ]);

  return { prev, next };
}

/** Related audio — audio lain dalam series yang sama (bisa untuk rekomendasi sampingan). */
export async function listRelatedAudio(
  seriesId: string,
  excludeAudioId: string,
  limit = 6,
): Promise<AudioCard[]> {
  return prisma.audio.findMany({
    where: {
      seriesId,
      published: true,
      id: { not: excludeAudioId },
    },
    include: audioCardInclude,
    orderBy: { nomorSesi: "asc" },
    take: limit,
  });
}

/**
 * Rekomendasi audio berdasarkan speaker yang sama (dari series yang sama).
 * Berguna untuk "kajian pemateri yang sama" di halaman audio.
 */
export async function listAudioBySameSpeaker(
  speakerIds: string[],
  excludeSeriesId: string,
  limit = 6,
): Promise<AudioCard[]> {
  return prisma.audio.findMany({
    where: {
      published: true,
      series: {
        speakers: { some: { speakerId: { in: speakerIds } } },
        id: { not: excludeSeriesId },
      },
    },
    include: audioCardInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/* ================================================================
   SEARCH & FILTER PUBLIK (Phase 10)
   ================================================================ */

/** Rentang durasi filter (menit). Semua batas dihitung dari kolom durasi (detik). */
export type DurationBucket = "<15" | "15-30" | "30-60" | "60-120" | ">120";

export const DURATION_BUCKETS: Record<
  DurationBucket,
  { label: string; range: { gte?: number; lte?: number } }
> = {
  "<15": { label: "< 15 menit", range: { lte: 15 * 60 } },
  "15-30": { label: "15–30 menit", range: { gte: 15 * 60, lte: 30 * 60 } },
  "30-60": { label: "30–60 menit", range: { gte: 30 * 60, lte: 60 * 60 } },
  "60-120": { label: "60–120 menit", range: { gte: 60 * 60, lte: 120 * 60 } },
  ">120": { label: "> 120 menit", range: { gte: 120 * 60 } },
};

export function isDurationBucket(value: string): value is DurationBucket {
  return value in DURATION_BUCKETS;
}

export type PublishedAudioFilter = {
  q?: string;
  seriesId?: string;
  seriesTypeId?: string;
  speakerId?: string;
  categoryId?: string;
  tagId?: string;
  duration?: DurationBucket;
  sort?: "newest" | "oldest" | "title" | "title_desc" | "duration_asc" | "duration_desc";
  page?: number;
  perPage?: number;
};

export function buildAudioSearchWhere(q: string): Prisma.AudioWhereInput {
  return {
    published: true,
    OR: [
      { judul: { contains: q, mode: "insensitive" } },
      { deskripsi: { contains: q, mode: "insensitive" } },
      { series: { judul: { contains: q, mode: "insensitive" } } },
      { series: { seriesType: { nama: { contains: q, mode: "insensitive" } } } },
      {
        series: { speakers: { some: { speaker: { nama: { contains: q, mode: "insensitive" } } } } },
      },
      { series: { tags: { some: { tag: { nama: { contains: q, mode: "insensitive" } } } } } },
    ],
  };
}

export async function countPublishedAudio(q?: string) {
  return prisma.audio.count({
    where: q?.trim() ? buildAudioSearchWhere(q.trim()) : { published: true },
  });
}

/** Jumlah audio berstatus draft, dibatasi ke satu series bila diberikan. */
export async function countAudioDrafts(seriesId?: string) {
  return prisma.audio.count({
    where: { ...(seriesId ? { seriesId } : {}), published: false },
  });
}

/** Daftar audio published + filter berlapis (AND antar filter). Hanya konten publik. */
export async function listPublishedAudioFiltered(opts: PublishedAudioFilter) {
  const { page = 1, perPage = 20 } = opts;
  const where: Prisma.AudioWhereInput = { published: true };

  if (opts.q) {
    const q = opts.q.trim();
    Object.assign(where, buildAudioSearchWhere(q));
  }
  if (opts.seriesId) {
    where.seriesId = opts.seriesId;
  }

  const seriesWhere: Prisma.SeriesWhereInput = {};
  if (opts.seriesTypeId) {
    seriesWhere.seriesTypeId = opts.seriesTypeId;
  }
  if (opts.speakerId) {
    seriesWhere.speakers = { some: { speakerId: opts.speakerId } };
  }
  if (opts.categoryId) {
    seriesWhere.categories = { some: { categoryId: opts.categoryId } };
  }
  if (opts.tagId) {
    seriesWhere.tags = { some: { tagId: opts.tagId } };
  }
  if (Object.keys(seriesWhere).length > 0) {
    where.series = seriesWhere;
  }

  if (opts.duration) {
    const { gte, lte } = DURATION_BUCKETS[opts.duration].range;
    where.durasi = { gte, lte };
  }

  const sortMap: Record<string, Prisma.AudioOrderByWithRelationInput> = {
    newest: { createdAt: "desc" },
    oldest: { createdAt: "asc" },
    title: { judul: "asc" },
    title_desc: { judul: "desc" },
    duration_asc: { durasi: "asc" },
    duration_desc: { durasi: "desc" },
  };
  const orderBy = sortMap[opts.sort ?? "newest"] ?? sortMap.newest;

  const [total, items] = await prisma.$transaction([
    prisma.audio.count({ where }),
    prisma.audio.findMany({
      where,
      include: audioCardInclude,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
    }),
  ]);

  return { items, total };
}

/* ================================================================
   ADMIN — manajemen konten
   ================================================================ */

export async function listAudioAdmin(opts: {
  q?: string;
  page?: number;
  perPage?: number;
  status?: "PUBLISHED" | "DRAFT" | "ALL";
  seriesId?: string;
  sort?: "sesi-asc" | "sesi-desc" | "terbaru";
}) {
  const { q, page = 1, perPage = 10, status, seriesId, sort } = opts;
  const where: Prisma.AudioWhereInput = {
    ...(q
      ? {
          OR: [
            { judul: { contains: q, mode: "insensitive" as const } },
            { slug: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(seriesId ? { seriesId } : {}),
    ...(status === "PUBLISHED" ? { published: true } : {}),
    ...(status === "DRAFT" ? { published: false } : {}),
  };

  const orderBy: Prisma.AudioOrderByWithRelationInput[] =
    sort === "sesi-desc"
      ? [{ nomorSesi: "desc" }, { updatedAt: "desc" }]
      : sort === "terbaru"
        ? [{ updatedAt: "desc" }]
        : [{ nomorSesi: "asc" }, { updatedAt: "desc" }];

  const [items, total] = await Promise.all([
    prisma.audio.findMany({
      where,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        series: { select: { id: true, judul: true, slug: true } },
        mediaSources: {
          take: 1,
          select: { id: true, provider: true, url: true, providerId: true },
        },
      },
    }),
    prisma.audio.count({ where }),
  ]);

  return { items, total, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function getAudioAdmin(id: string) {
  return prisma.audio.findUnique({
    where: { id },
    include: {
      series: { select: { id: true, judul: true } },
      mediaSources: {
        take: 1,
        select: { id: true, provider: true, url: true, providerId: true, metadata: true },
      },
    },
  });
}

export async function audioSlugExists(slug: string, excludeId?: string) {
  const item = await prisma.audio.findUnique({ where: { slug } });
  return Boolean(item && item.id !== excludeId);
}

export async function audioNomorSesiExists(
  seriesId: string,
  nomorSesi: number,
  excludeId?: string,
) {
  const item = await prisma.audio.findFirst({
    where: { seriesId, nomorSesi },
    select: { id: true },
  });
  return Boolean(item && item.id !== excludeId);
}

/** Nomor sesi kosong terkecil (gap) atau max+1 bila tidak ada gap. */
export async function getNextNomorSesi(seriesId: string): Promise<number> {
  const used = await prisma.audio.findMany({
    where: { seriesId },
    select: { nomorSesi: true },
    orderBy: { nomorSesi: "asc" },
  });
  const set = new Set(used.map((a) => a.nomorSesi));
  let n = 1;
  while (set.has(n)) n++;
  return n;
}
