"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { CommentTarget } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/session";
import {
  createComment,
  findCommentTarget,
  findRecentCommentByIp,
  listCommentsByTarget,
  type CommentPublic,
} from "@/repositories/comment-repository";
import { submitCommentSchema, type SubmitCommentInput } from "@/validation/comment";

type CommentState<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };

/** Daftar komentar publik sebuah target + nama pengunjung yang sedang login (untuk prefill). */
export async function getComments(targetType: CommentTarget, targetId: string) {
  const [comments, user] = await Promise.all([
    listCommentsByTarget(targetType, targetId),
    getCurrentUser().catch(() => null),
  ]);
  return {
    comments,
    currentUserName: user?.name ?? null,
  } as {
    comments: CommentPublic[];
    currentUserName: string | null;
  };
}

/** Kirim komentar — boleh dari pengunjung anonim (tanpa login). */
export async function submitComment(input: SubmitCommentInput): Promise<CommentState<CommentPublic>> {
  const parsed = submitCommentSchema.safeParse(input);
  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message ?? "Data komentar tidak valid.";
    return { ok: false, error: { code: "INVALID_INPUT", message } };
  }

  const { targetType, targetId } = parsed.data;

  const target = await findCommentTarget(targetType, targetId);
  if (!target) {
    return { ok: false, error: { code: "TARGET_NOT_FOUND", message: "Target komentar tidak ditemukan." } };
  }

  const user = await getCurrentUser().catch(() => null);
  if (user && user.status !== "ACTIVE") {
    return { ok: false, error: { code: "USER_INACTIVE", message: "Akun tidak aktif." } };
  }

  const headerList = await headers();
  const ipHash = hashIp(headerList.get("x-forwarded-for") ?? headerList.get("x-real-ip"));

  const recent = await findRecentCommentByIp(ipHash, targetType, targetId);
  if (recent) {
    return {
      ok: false,
      error: { code: "RATE_LIMITED", message: "Terlalu cepat. Tunggu 1 menit sebelum mengirim komentar lagi." },
    };
  }

  const nama = user?.name ?? parsed.data.nama ?? "";

  try {
    const comment = await createComment({
      targetType,
      targetId,
      userId: user?.id ?? null,
      nama,
      content: parsed.data.content,
      ipHash,
    });
    return { ok: true, data: comment };
  } catch {
    return { ok: false, error: { code: "INTERNAL", message: "Gagal menyimpan komentar. Coba lagi." } };
  }
}

function hashIp(ip: string | null): string {
  if (!ip) return "unknown";
  const salt = process.env.AUTH_SECRET ?? "msi-audio-comment-salt";
  return createHash("sha256").update(`${ip}:${salt}`).digest("hex");
}