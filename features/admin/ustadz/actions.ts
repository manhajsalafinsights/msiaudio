"use server";

import { prisma } from "@/lib/prisma/client";
import { requireAdmin } from "@/lib/auth/session";
import type { ActionState } from "@/types/action";
import { slugify } from "@/utils/slugify";
import { uniqueSlug } from "@/features/admin/lib/slug";
import { ustadzFormSchema, type UstadzFormInput } from "@/features/admin/ustadz/validation";
import { cleanupCover } from "@/lib/supabase/storage";

function slugExists(slug: string, excludeId?: string) {
  return prisma.speaker
    .findUnique({ where: { slug } })
    .then((s) => Boolean(s && s.id !== excludeId));
}

async function resolveSlug(input: UstadzFormInput, excludeId?: string) {
  const base = input.slug.trim() || slugify(input.nama);
  if (!base) throw new Error("Slug tidak dapat dibuat dari nama");
  return uniqueSlug(base, (slug) => slugExists(slug, excludeId));
}

export async function createUstadz(input: UstadzFormInput): Promise<ActionState> {
  try {
    await requireAdmin();
    const parsed = ustadzFormSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: { code: "VALIDATION_ERROR", message: "Data tidak valid" } };
    }
    const data = parsed.data;
    const slug = await resolveSlug(data);

    await prisma.speaker.create({
      data: {
        nama: data.nama,
        slug,
        foto: data.foto || null,
        bio: data.bio || null,
        status: data.status,
      },
    });

    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: { code: "UNKNOWN_ERROR", message: error instanceof Error ? error.message : "Gagal membuat ustadz" } };
  }
}

export async function updateUstadz(id: string, input: UstadzFormInput): Promise<ActionState> {
  try {
    await requireAdmin();
    const parsed = ustadzFormSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: { code: "VALIDATION_ERROR", message: "Data tidak valid" } };
    }
    const data = parsed.data;
    const slug = await resolveSlug(data, id);

    const existing = await prisma.speaker.findUnique({ where: { id }, select: { foto: true } });
    await prisma.speaker.update({
      where: { id },
      data: {
        nama: data.nama,
        slug,
        foto: data.foto || null,
        bio: data.bio || null,
        status: data.status,
      },
    });
    await cleanupCover(existing?.foto ?? null, data.foto || null);

    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: { code: "UNKNOWN_ERROR", message: error instanceof Error ? error.message : "Gagal memperbarui ustadz" } };
  }
}

export async function deleteUstadz(id: string): Promise<ActionState> {
  try {
    await requireAdmin();
    const existing = await prisma.speaker.findUnique({ where: { id }, select: { foto: true } });
    if (!existing) {
      return { ok: false, error: { code: "NOT_FOUND", message: "Ustadz tidak ditemukan" } };
    }
    const linkedSeries = await prisma.seriesSpeaker.count({ where: { speakerId: id } });
    if (linkedSeries > 0) {
      return {
        ok: false,
        error: { code: "CONFLICT", message: "Ustadz tidak dapat dihapus karena masih dipakai series" },
      };
    }
    await prisma.speaker.delete({ where: { id } });
    await cleanupCover(existing.foto ?? null, null);
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: { code: "UNKNOWN_ERROR", message: error instanceof Error ? error.message : "Gagal menghapus ustadz" } };
  }
}

export async function setUstadzStatus(id: string, status: "ACTIVE" | "INACTIVE"): Promise<ActionState> {
  try {
    await requireAdmin();
    await prisma.speaker.update({ where: { id }, data: { status } });
    return { ok: true, data: undefined };
  } catch {
    return { ok: false, error: { code: "UNKNOWN_ERROR", message: "Gagal mengubah status" } };
  }
}

export async function bulkUstadzStatus(ids: string[], status: "ACTIVE" | "INACTIVE"): Promise<ActionState> {
  try {
    await requireAdmin();
    if (ids.length === 0) return { ok: false, error: { code: "VALIDATION_ERROR", message: "Tidak ada data dipilih" } };
    await prisma.speaker.updateMany({ where: { id: { in: ids } }, data: { status } });
    return { ok: true, data: undefined };
  } catch {
    return { ok: false, error: { code: "UNKNOWN_ERROR", message: "Gagal mengubah status" } };
  }
}

export async function bulkDeleteUstadz(ids: string[]): Promise<ActionState> {
  try {
    await requireAdmin();
    if (ids.length === 0) return { ok: false, error: { code: "VALIDATION_ERROR", message: "Tidak ada data dipilih" } };

    const linked = await prisma.seriesSpeaker.findMany({
      where: { speakerId: { in: ids } },
      select: { speakerId: true },
    });
    const linkedIds = new Set(linked.map((l) => l.speakerId));
    const safeIds = ids.filter((id) => !linkedIds.has(id));

    if (safeIds.length > 0) {
      const speakers = await prisma.speaker.findMany({
        where: { id: { in: safeIds } },
        select: { foto: true },
      });
      await prisma.speaker.deleteMany({ where: { id: { in: safeIds } } });
      await Promise.all(speakers.filter((s) => s.foto).map((s) => cleanupCover(s.foto, null)));
    }

    const blocked = ids.length - safeIds.length;
    if (blocked > 0) {
      return {
        ok: false,
        error: {
          code: "CONFLICT",
          message: `${blocked} ustadz tidak dapat dihapus karena masih dipakai series`,
        },
      };
    }
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: { code: "UNKNOWN_ERROR", message: error instanceof Error ? error.message : "Gagal menghapus" } };
  }
}
