"use server";

import { prisma } from "@/lib/prisma/client";
import { requireAdmin } from "@/lib/auth/session";
import type { ActionState } from "@/types/action";
import { slugify } from "@/utils/slugify";
import { uniqueSlug } from "@/features/admin/lib/slug";
import { categorySlugExists } from "@/repositories/category-repository";
import { kategoriFormSchema, type KategoriFormInput } from "@/features/admin/kategori/validation";

async function resolveSlug(input: KategoriFormInput, excludeId?: string) {
  const base = input.slug.trim() || slugify(input.nama);
  if (!base) throw new Error("Slug tidak dapat dibuat dari nama");
  return uniqueSlug(base, (slug) => categorySlugExists(slug, excludeId));
}

export async function createKategori(input: KategoriFormInput): Promise<ActionState> {
  try {
    await requireAdmin();
    const parsed = kategoriFormSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: { code: "VALIDATION_ERROR", message: "Data tidak valid" } };
    }
    const data = parsed.data;
    const slug = await resolveSlug(data);

    await prisma.category.create({
      data: { nama: data.nama, slug, icon: data.icon || null },
    });

    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: { code: "UNKNOWN_ERROR", message: error instanceof Error ? error.message : "Gagal membuat kategori" } };
  }
}

export async function updateKategori(id: string, input: KategoriFormInput): Promise<ActionState> {
  try {
    await requireAdmin();
    const parsed = kategoriFormSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: { code: "VALIDATION_ERROR", message: "Data tidak valid" } };
    }
    const data = parsed.data;
    const slug = await resolveSlug(data, id);

    await prisma.category.update({
      where: { id },
      data: { nama: data.nama, slug, icon: data.icon || null },
    });

    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: { code: "UNKNOWN_ERROR", message: error instanceof Error ? error.message : "Gagal memperbarui kategori" } };
  }
}

export async function deleteKategori(id: string): Promise<ActionState> {
  try {
    await requireAdmin();
    await prisma.category.delete({ where: { id } });
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: { code: "UNKNOWN_ERROR", message: error instanceof Error ? error.message : "Gagal menghapus kategori" } };
  }
}

export async function bulkDeleteKategori(ids: string[]): Promise<ActionState> {
  try {
    await requireAdmin();
    if (ids.length === 0) return { ok: false, error: { code: "VALIDATION_ERROR", message: "Tidak ada data dipilih" } };
    await prisma.category.deleteMany({ where: { id: { in: ids } } });
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: { code: "UNKNOWN_ERROR", message: error instanceof Error ? error.message : "Gagal menghapus" } };
  }
}
