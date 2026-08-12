import { cache } from "react";
import { Prisma, CommentTarget } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";

/** Select standar untuk komentar publik (tanpa data pribadi user). */
export const commentPublicSelect = {
  id: true,
  targetType: true,
  targetId: true,
  nama: true,
  content: true,
  createdAt: true,
} satisfies Prisma.CommentSelect;

export type CommentPublic = Prisma.CommentGetPayload<{
  select: typeof commentPublicSelect;
}>;

/** Daftar komentar untuk sebuah target (kitab / series) — urut dari terbaru. */
export const listCommentsByTarget = cache(async (targetType: CommentTarget, targetId: string) => {
  const comments = await prisma.comment.findMany({
    where: { targetType, targetId },
    select: commentPublicSelect,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return comments;
});

/** Jumlah komentar sebuah target — untuk badge/penghitung di kartu. */
export const countCommentsByTarget = cache(async (targetType: CommentTarget, targetId: string) => {
  const count = await prisma.comment.count({ where: { targetType, targetId } });
  return count;
});

/** Menyimpan komentar baru (dipanggil dari server action). */
export function createComment(data: {
  targetType: CommentTarget;
  targetId: string;
  userId: string | null;
  nama: string;
  content: string;
  ipHash: string | null;
}) {
  return prisma.comment.create({ data, select: commentPublicSelect });
}

/** Cek apakah target valid & published (anti-komentar ke konten privat). */
export function findCommentTarget(targetType: CommentTarget, targetId: string) {
  if (targetType === CommentTarget.KITAB) {
    return prisma.seriesType.findFirst({
      where: { id: targetId },
      select: { id: true },
    });
  }
  return prisma.series.findFirst({
    where: { id: targetId, published: true },
    select: { id: true },
  });
}

/** Rate limit: komentar dari IP yang sama ke target yang sama dalam 60 detik. */
export function findRecentCommentByIp(ipHash: string, targetType: CommentTarget, targetId: string) {
  const since = new Date(Date.now() - 60_000);
  return prisma.comment.findFirst({
    where: { ipHash, targetType, targetId, createdAt: { gte: since } },
    select: { id: true },
  });
}

export type CommentAdminRow = CommentPublic & {
  targetLabel: string;
  targetSlug: string | null;
};

/** Daftar komentar untuk panel admin (lengkap, tanpa batas take 100). */
export async function listCommentsAdmin(opts: {
  page: number;
  perPage: number;
  q?: string;
  targetType?: CommentTarget;
}): Promise<{ items: CommentAdminRow[]; total: number; totalPages: number }> {
  const where: Prisma.CommentWhereInput = {};
  if (opts.targetType) {
    where.targetType = opts.targetType;
  }
  if (opts.q) {
    const q = opts.q.trim();
    where.OR = [
      { nama: { contains: q, mode: "insensitive" } },
      { content: { contains: q, mode: "insensitive" } },
    ];
  }

  const [total, comments] = await Promise.all([
    prisma.comment.count({ where }),
    prisma.comment.findMany({
      where,
      select: commentPublicSelect,
      orderBy: { createdAt: "desc" },
      skip: (opts.page - 1) * opts.perPage,
      take: opts.perPage,
    }),
  ]);

  const kitabIds = [
    ...new Set(comments.filter((c) => c.targetType === CommentTarget.KITAB).map((c) => c.targetId)),
  ];
  const seriesIds = [
    ...new Set(comments.filter((c) => c.targetType === CommentTarget.SERIES).map((c) => c.targetId)),
  ];

  const [kitabs, series] = await Promise.all([
    kitabIds.length > 0
      ? prisma.seriesType.findMany({
          where: { id: { in: kitabIds } },
          select: { id: true, nama: true, slug: true },
        })
      : Promise.resolve([]),
    seriesIds.length > 0
      ? prisma.series.findMany({
          where: { id: { in: seriesIds } },
          select: { id: true, judul: true, slug: true },
        })
      : Promise.resolve([]),
  ]);

  const kitabMap = new Map(kitabs.map((k) => [k.id, k]));
  const seriesMap = new Map(series.map((s) => [s.id, s]));

  const items = comments.map((comment) => {
    if (comment.targetType === CommentTarget.KITAB) {
      const kitab = kitabMap.get(comment.targetId);
      return {
        ...comment,
        targetLabel: kitab?.nama ?? `Kitab #${comment.targetId.slice(0, 8)}`,
        targetSlug: kitab?.slug ?? null,
      };
    }
    const item = seriesMap.get(comment.targetId);
    return {
      ...comment,
      targetLabel: item?.judul ?? `Series #${comment.targetId.slice(0, 8)}`,
      targetSlug: item?.slug ?? null,
    };
  });

  return { items, total, totalPages: Math.max(1, Math.ceil(total / opts.perPage)) };
}

export function deleteCommentById(id: string) {
  return prisma.comment.delete({ where: { id } });
}

export function deleteCommentsByIds(ids: string[]) {
  return prisma.comment.deleteMany({ where: { id: { in: ids } } });
}