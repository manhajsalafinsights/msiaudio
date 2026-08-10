"use server";

import { prisma } from "@/lib/prisma/client";
import { requireAdmin } from "@/lib/auth/session";
import type { ActionState } from "@/types/action";
import type { Role, UserStatus } from "@prisma/client";

export async function setUserStatus(id: string, status: UserStatus): Promise<ActionState> {
  try {
    const admin = await requireAdmin();
    if (id === admin.id) {
      return { ok: false, error: { code: "VALIDATION_ERROR", message: "Tidak dapat mengubah status akun sendiri" } };
    }
    await prisma.user.update({ where: { id }, data: { status } });
    return { ok: true, data: undefined };
  } catch {
    return { ok: false, error: { code: "UNKNOWN_ERROR", message: "Gagal mengubah status" } };
  }
}

export async function setUserRole(id: string, role: Role): Promise<ActionState> {
  try {
    const admin = await requireAdmin();
    if (admin.role !== "SUPER_ADMIN") {
      return { ok: false, error: { code: "FORBIDDEN", message: "Hanya Super Admin yang dapat mengubah peran" } };
    }
    if (id === admin.id) {
      return { ok: false, error: { code: "VALIDATION_ERROR", message: "Tidak dapat mengubah peran sendiri" } };
    }
    await prisma.user.update({ where: { id }, data: { role } });
    return { ok: true, data: undefined };
  } catch {
    return { ok: false, error: { code: "UNKNOWN_ERROR", message: "Gagal mengubah peran" } };
  }
}
