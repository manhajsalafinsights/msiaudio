"use server";

import { requireAdmin } from "@/lib/auth/session";
import type { ActionState } from "@/types/action";
import { deleteCommentById, deleteCommentsByIds } from "@/repositories/comment-repository";

export async function deleteComment(id: string): Promise<ActionState> {
  try {
    await requireAdmin();
    await deleteCommentById(id);
    return { ok: true, data: undefined };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: error instanceof Error ? error.message : "Gagal menghapus komentar",
      },
    };
  }
}

export async function bulkDeleteComments(ids: string[]): Promise<ActionState> {
  try {
    await requireAdmin();
    if (ids.length === 0) {
      return { ok: false, error: { code: "VALIDATION_ERROR", message: "Tidak ada data dipilih" } };
    }
    await deleteCommentsByIds(ids);
    return { ok: true, data: undefined };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: error instanceof Error ? error.message : "Gagal menghapus komentar",
      },
    };
  }
}