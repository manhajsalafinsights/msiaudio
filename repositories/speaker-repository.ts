import { cache } from "react";
import { prisma } from "@/lib/prisma/client";
import type { SpeakerStatus } from "@prisma/client";
import { seriesPublicInclude } from "@/repositories/series-repository";

export async function listActiveSpeakers() {
  return prisma.speaker.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, nama: true, slug: true, foto: true, bio: true },
    orderBy: { nama: "asc" },
  });
}

export async function listSpeakersAdmin(opts: {
  q?: string;
  page?: number;
  perPage?: number;
  status?: SpeakerStatus | "ALL";
}) {
  const { q, page = 1, perPage = 10, status } = opts;
  const where = {
    ...(q
      ? {
          OR: [
            { nama: { contains: q, mode: "insensitive" as const } },
            { slug: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(status && status !== "ALL" ? { status } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.speaker.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: { _count: { select: { series: true } } },
    }),
    prisma.speaker.count({ where }),
  ]);

  return { items, total, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function getSpeakerBySlug(slug: string) {
  return prisma.speaker.findFirst({
    where: { slug, status: "ACTIVE" },
    select: { id: true, nama: true, slug: true, foto: true, bio: true },
  });
}

export async function getSpeakerById(id: string) {
  return prisma.speaker.findUnique({ where: { id } });
}

export async function speakerExists(slug: string) {
  const speaker = await prisma.speaker.findUnique({
    where: { slug },
    select: { id: true },
  });
  return Boolean(speaker);
}

/** Search ustadz/pemateri publik — hanya status ACTIVE. */
export async function searchSpeakers(q: string, limit = 20) {
  const query = q.trim();
  return prisma.speaker.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { nama: { contains: query, mode: "insensitive" } },
        { bio: { contains: query, mode: "insensitive" } },
      ],
    },
    select: { id: true, nama: true, slug: true, foto: true, bio: true },
    orderBy: { nama: "asc" },
    take: limit,
  });
}

export async function countSearchSpeakers(q: string) {
  return prisma.speaker.count({
    where: {
      status: "ACTIVE",
      OR: [
        { nama: { contains: q.trim(), mode: "insensitive" } },
        { bio: { contains: q.trim(), mode: "insensitive" } },
      ],
    },
  });
}

/* ================================================================
   PUBLIK (Phase 11 — Explore & Discovery)
   ================================================================ */

export type SpeakerPublic = {
  id: string;
  nama: string;
  slug: string;
  foto: string | null;
  bio: string | null;
  seriesCount: number;
  totalAudio: number;
};

/**
 * Pemateri ACTIVE yang membawakan ≥1 series published.
 * Jumlah series & audio dihitung massal (3 query, tanpa N+1).
 */
export async function listPublishedSpeakers(): Promise<SpeakerPublic[]> {
  const [speakers, seriesPivot, audioGroup] = await Promise.all([
    prisma.speaker.findMany({
      where: { status: "ACTIVE", series: { some: { series: { published: true } } } },
      select: {
        id: true,
        nama: true,
        slug: true,
        foto: true,
        bio: true,
        _count: { select: { series: { where: { series: { published: true } } } } },
      },
      orderBy: { nama: "asc" },
    }),
    prisma.seriesSpeaker.findMany({
      where: { series: { published: true } },
      select: { speakerId: true, seriesId: true },
    }),
    prisma.audio.groupBy({
      by: ["seriesId"],
      where: { published: true },
      _count: true,
    }),
  ]);

  const audioBySeries = new Map(audioGroup.map((g) => [g.seriesId, g._count]));
  const audioBySpeaker = new Map<string, number>();
  for (const pivot of seriesPivot) {
    const total = audioBySpeaker.get(pivot.speakerId) ?? 0;
    audioBySpeaker.set(pivot.speakerId, total + (audioBySeries.get(pivot.seriesId) ?? 0));
  }

  return speakers.map((s) => ({
    id: s.id,
    nama: s.nama,
    slug: s.slug,
    foto: s.foto,
    bio: s.bio,
    seriesCount: s._count.series,
    totalAudio: audioBySpeaker.get(s.id) ?? 0,
  }));
}

/** Semua slug pemateri publik — untuk generateStaticParams. */
export async function listPublishedSpeakerSlugs() {
  const rows = await prisma.speaker.findMany({
    where: { status: "ACTIVE", series: { some: { series: { published: true } } } },
    select: { slug: true },
  });
  return rows.map((row) => row.slug);
}

/** Detail pemateri publik + series published yang dibawakan. */
export const findPublishedSpeakerBySlug = cache(async (slug: string) => {
  return prisma.speaker.findFirst({
    where: { slug, status: "ACTIVE", series: { some: { series: { published: true } } } },
    include: {
      series: {
        where: { series: { published: true } },
        include: { series: { include: seriesPublicInclude } },
        orderBy: { order: "asc" as const },
      },
    },
  });
});
