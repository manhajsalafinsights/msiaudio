"use server";

import { prisma } from "@/lib/prisma/client";
import { requireAdmin } from "@/lib/auth/session";
import type { ActionState } from "@/types/action";
import { slugify } from "@/utils/slugify";
import { uniqueSlug } from "@/features/admin/lib/slug";
import { seriesTypeSlugExists } from "@/repositories/series-type-repository";
import { kitabFormSchema, type KitabFormInput } from "@/features/admin/kitab/validation";

async function resolveSlug(input: KitabFormInput, excludeId?: string) {
  const base = input.slug.trim() || slugify(input.nama);
  if (!base) throw new Error("Slug tidak dapat dibuat dari nama");
  return uniqueSlug(base, (slug) => seriesTypeSlugExists(slug, excludeId));
}

export async function createKitab(input: KitabFormInput): Promise<ActionState> {
  try {
    await requireAdmin();
    const parsed = kitabFormSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: { code: "VALIDATION_ERROR", message: "Data tidak valid" } };
    }
    const data = parsed.data;
    const slug = await resolveSlug(data);

    await prisma.seriesType.create({
      data: {
        nama: data.nama,
        slug,
        icon: data.icon || null,
        description: data.description || null,
        isKitab: data.isKitab,
      },
    });

    return { ok: true, data: undefined };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: error instanceof Error ? error.message : "Gagal membuat kitab",
      },
    };
  }
}

export async function updateKitab(id: string, input: KitabFormInput): Promise<ActionState> {
  try {
    await requireAdmin();
    const parsed = kitabFormSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: { code: "VALIDATION_ERROR", message: "Data tidak valid" } };
    }
    const data = parsed.data;
    const slug = await resolveSlug(data, id);

    await prisma.seriesType.update({
      where: { id },
      data: {
        nama: data.nama,
        slug,
        icon: data.icon || null,
        description: data.description || null,
        isKitab: data.isKitab,
      },
    });

    return { ok: true, data: undefined };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: error instanceof Error ? error.message : "Gagal memperbarui kitab",
      },
    };
  }
}

export async function setKitabIsKitab(id: string, isKitab: boolean): Promise<ActionState> {
  try {
    await requireAdmin();
    await prisma.seriesType.update({ where: { id }, data: { isKitab } });
    return { ok: true, data: undefined };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: error instanceof Error ? error.message : "Gagal mengubah tampilan kitab",
      },
    };
  }
}

export async function deleteKitab(id: string): Promise<ActionState> {
  try {
    await requireAdmin();
    await prisma.seriesType.delete({ where: { id } });
    return { ok: true, data: undefined };
  } catch (error) {
    const message =
      error instanceof Error && error.message.toLowerCase().includes("restrict")
        ? "Kitab tidak dapat dihapus karena masih dipakai series"
        : error instanceof Error
          ? error.message
          : "Gagal menghapus kitab";
    return { ok: false, error: { code: "UNKNOWN_ERROR", message } };
  }
}

export async function bulkDeleteKitab(ids: string[]): Promise<ActionState> {
  try {
    await requireAdmin();
    if (ids.length === 0)
      return { ok: false, error: { code: "VALIDATION_ERROR", message: "Tidak ada data dipilih" } };

    const used = await prisma.series.findMany({
      where: { seriesTypeId: { in: ids } },
      select: { seriesTypeId: true },
    });
    const blockedIds = new Set(used.map((s) => s.seriesTypeId));
    const safeIds = ids.filter((id) => !blockedIds.has(id));

    if (safeIds.length > 0) {
      await prisma.seriesType.deleteMany({ where: { id: { in: safeIds } } });
    }

    const blocked = ids.length - safeIds.length;
    if (blocked > 0) {
      return {
        ok: false,
        error: {
          code: "CONFLICT",
          message: `${blocked} kitab tidak dapat dihapus karena masih dipakai series`,
        },
      };
    }
    return { ok: true, data: undefined };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: error instanceof Error ? error.message : "Gagal menghapus",
      },
    };
  }
}
