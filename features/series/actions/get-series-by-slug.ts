"use server";

import { getSeriesBySlug as _getSeriesBySlug } from "@/services/series-service";
import {
  type SeriesDetailSlugInput,
  SeriesDetailSlugSchema,
} from "@/features/series/validation/series.schema";
import type { ActionState } from "@/types/action";
import type { SeriesDetail } from "@/repositories/series-repository";

export async function fetchSeriesBySlug(
  input: SeriesDetailSlugInput,
): Promise<ActionState<SeriesDetail>> {
  try {
    const parsed = SeriesDetailSlugSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: { code: "VALIDATION_ERROR", message: "Slug series tidak valid" },
      };
    }

    const series = await _getSeriesBySlug(parsed.data.slug);
    return { ok: true, data: series };
  } catch (error) {
    if (error instanceof Error) {
      return { ok: false, error: { code: "UNKNOWN_ERROR", message: error.message } };
    }
    return { ok: false, error: { code: "UNKNOWN_ERROR", message: "Gagal memuat series" } };
  }
}
