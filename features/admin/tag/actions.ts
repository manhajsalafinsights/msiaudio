"use server";

import { prisma } from "@/lib/prisma/client";
import { requireAdmin } from "@/lib/auth/session";
import type { ActionState } from "@/types/action";
import { slugify } from "@/utils/slugify";
import { uniqueSlug } from "@/features/admin/lib/slug";
import { tagSlugExists } from "@/repositories/tag-repository";
import { tagFormSchema, type TagFormInput } from "@/features/admin/tag/validation";

async function resolveSlug(input: TagFormInput, excludeId?: string) {
  const base = input.slug.trim() || slugify(input.nama);
  if (!base) throw new Error("Slug tidak dapat dibuat dari nama");
  return uniqueSlug(base, (slug) => tagSlugExists(slug, excludeId));
}

export async function createTag(input: TagFormInput): Promise<ActionState> {
  try {
    await requireAdmin();
    const parsed = tagFormSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: { code: "VALIDATION_ERROR", message: "Data tidak valid" } };
    }
    const data = parsed.data;
    const slug = await resolveSlug(data);

    await prisma.tag.create({
      data: { nama: data.nama, slug },
    });

    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: { code: "UNKNOWN_ERROR", message: error instanceof Error ? error.message : "Gagal membuat tag" } };
  }
}

export async function updateTag(id: string, input: TagFormInput): Promise<ActionState> {
  try {
    await requireAdmin();
    const parsed = tagFormSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: { code: "VALIDATION_ERROR", message: "Data tidak valid" } };
    }
    const data = parsed.data;
    const slug = await resolveSlug(data, id);

    await prisma.tag.update({
      where: { id },
      data: { nama: data.nama, slug },
    });

    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: { code: "UNKNOWN_ERROR", message: error instanceof Error ? error.message : "Gagal memperbarui tag" } };
  }
}

export async function deleteTag(id: string): Promise<ActionState> {
  try {
    await requireAdmin();
    await prisma.tag.delete({ where: { id } });
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: { code: "UNKNOWN_ERROR", message: error instanceof Error ? error.message : "Gagal menghapus tag" } };
  }
}

export async function bulkDeleteTag(ids: string[]): Promise<ActionState> {
  try {
    await requireAdmin();
    if (ids.length === 0) return { ok: false, error: { code: "VALIDATION_ERROR", message: "Tidak ada data dipilih" } };
    await prisma.tag.deleteMany({ where: { id: { in: ids } } });
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: { code: "UNKNOWN_ERROR", message: error instanceof Error ? error.message : "Gagal menghapus" } };
  }
}
