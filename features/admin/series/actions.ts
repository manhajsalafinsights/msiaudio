"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/client";
import { requireAdmin } from "@/lib/auth/session";
import type { ActionState } from "@/types/action";
import { slugify } from "@/utils/slugify";
import { uniqueSlug } from "@/features/admin/lib/slug";
import { seriesSlugExists, recalcSeriesTotals } from "@/repositories/series-repository";
import { seriesFormSchema, type SeriesFormInput } from "@/features/admin/series/validation";
import { cleanupCover } from "@/lib/supabase/storage";

function revalidatePublic() {
  revalidatePath("/", "layout");
}

async function resolveSlug(input: SeriesFormInput, excludeId?: string) {
  const base = input.slug.trim() || slugify(input.judul);
  if (!base) throw new Error("Slug tidak dapat dibuat dari judul");
  return uniqueSlug(base, (slug) => seriesSlugExists(slug, excludeId));
}

function toPivotPayload(input: SeriesFormInput, sync = false) {
  const deleteMany = sync ? { deleteMany: {} } : {};
  return {
    speakers: {
      ...deleteMany,
      create: input.speakerIds.map((speakerId, index) => ({
        speakerId,
        order: index,
      })),
    },
    categories: {
      ...deleteMany,
      create: input.categoryIds.map((categoryId) => ({ categoryId })),
    },
    tags: {
      ...deleteMany,
      create: input.tagIds.map((tagId) => ({ tagId })),
    },
  };
}

export async function createSeries(input: SeriesFormInput): Promise<ActionState> {
  try {
    await requireAdmin();
    const parsed = seriesFormSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: { code: "VALIDATION_ERROR", message: "Data tidak valid" } };
    }
    const data = parsed.data;
    const slug = await resolveSlug(data);

    const series = await prisma.series.create({
      data: {
        judul: data.judul,
        slug,
        cover: data.cover || null,
        deskripsi: data.deskripsi || null,
        seriesTypeId: data.seriesTypeId,
        published: data.published,
        ...toPivotPayload(data),
      },
    });

    await recalcSeriesTotals(series.id);
    revalidatePublic();
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: { code: "UNKNOWN_ERROR", message: error instanceof Error ? error.message : "Gagal membuat series" } };
  }
}

export async function updateSeries(id: string, input: SeriesFormInput): Promise<ActionState> {
  try {
    await requireAdmin();
    const parsed = seriesFormSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: { code: "VALIDATION_ERROR", message: "Data tidak valid" } };
    }
    const data = parsed.data;
    const slug = await resolveSlug(data, id);

    const existing = await prisma.series.findUnique({ where: { id }, select: { cover: true } });
    await prisma.series.update({
      where: { id },
      data: {
        judul: data.judul,
        slug,
        cover: data.cover || null,
        deskripsi: data.deskripsi || null,
        seriesTypeId: data.seriesTypeId,
        published: data.published,
        ...toPivotPayload(data, true),
      },
    });
    await cleanupCover(existing?.cover ?? null, data.cover || null);

    await recalcSeriesTotals(id);
    revalidatePublic();
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: { code: "UNKNOWN_ERROR", message: error instanceof Error ? error.message : "Gagal memperbarui series" } };
  }
}

export async function deleteSeries(id: string): Promise<ActionState> {
  try {
    await requireAdmin();
    const existing = await prisma.series.findUnique({ where: { id }, select: { cover: true } });
    await prisma.series.delete({ where: { id } });
    await cleanupCover(existing?.cover ?? null, null);
    revalidatePublic();
    return { ok: true, data: undefined };
  } catch (error) {
    const message =
      error instanceof Error && error.message.toLowerCase().includes("restrict")
        ? "Series tidak dapat dihapus karena masih memiliki audio"
        : error instanceof Error
          ? error.message
          : "Gagal menghapus series";
    return { ok: false, error: { code: "UNKNOWN_ERROR", message } };
  }
}

export async function setSeriesStatus(id: string, published: boolean): Promise<ActionState> {
  try {
    await requireAdmin();
    await prisma.series.update({ where: { id }, data: { published } });
    revalidatePublic();
    return { ok: true, data: undefined };
  } catch {
    return { ok: false, error: { code: "UNKNOWN_ERROR", message: "Gagal mengubah status" } };
  }
}

export async function bulkSeriesStatus(ids: string[], published: boolean): Promise<ActionState> {
  try {
    await requireAdmin();
    if (ids.length === 0) return { ok: false, error: { code: "VALIDATION_ERROR", message: "Tidak ada data dipilih" } };
    await prisma.series.updateMany({ where: { id: { in: ids } }, data: { published } });
    revalidatePublic();
    return { ok: true, data: undefined };
  } catch {
    return { ok: false, error: { code: "UNKNOWN_ERROR", message: "Gagal mengubah status" } };
  }
}

export async function updateSeriesType(seriesId: string, seriesTypeId: string): Promise<ActionState> {
  try {
    await requireAdmin();
    if (!seriesId || !seriesTypeId) {
      return { ok: false, error: { code: "VALIDATION_ERROR", message: "Data tidak valid" } };
    }
    const type = await prisma.seriesType.findUnique({ where: { id: seriesTypeId } });
    if (!type) {
      return { ok: false, error: { code: "VALIDATION_ERROR", message: "Tipe series tidak ditemukan" } };
    }
    await prisma.series.update({
      where: { id: seriesId },
      data: { seriesTypeId },
    });
    revalidatePublic();
    return { ok: true, data: undefined };
  } catch (error) {
    return {
      ok: false,
      error: { code: "UNKNOWN_ERROR", message: error instanceof Error ? error.message : "Gagal mengubah tipe series" },
    };
  }
}

export async function bulkDeleteSeries(ids: string[]): Promise<ActionState> {
  try {
    await requireAdmin();
    if (ids.length === 0) return { ok: false, error: { code: "VALIDATION_ERROR", message: "Tidak ada data dipilih" } };

    const withAudio = await prisma.audio.findMany({
      where: { seriesId: { in: ids } },
      select: { seriesId: true },
    });
    const blockedIds = new Set(withAudio.map((a) => a.seriesId));
    const safeIds = ids.filter((id) => !blockedIds.has(id));

    if (safeIds.length > 0) {
      const covers = await prisma.series.findMany({
        where: { id: { in: safeIds } },
        select: { cover: true },
      });
      await prisma.series.deleteMany({ where: { id: { in: safeIds } } });
      await Promise.all(covers.filter((c) => c.cover).map((c) => cleanupCover(c.cover, null)));
    }

    const blocked = ids.length - safeIds.length;
    if (blocked > 0) {
      return {
        ok: false,
        error: { code: "CONFLICT", message: `${blocked} series tidak dapat dihapus karena masih memiliki audio` },
      };
    }
    revalidatePublic();
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: { code: "UNKNOWN_ERROR", message: error instanceof Error ? error.message : "Gagal menghapus" } };
  }
}
