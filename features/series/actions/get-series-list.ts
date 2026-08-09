"use server";

import { getSeriesList as _getSeriesList } from "@/services/series-service";
import {
  type SeriesListFilterInput,
  SeriesListFilterSchema,
} from "@/features/series/validation/series.schema";
import type { ActionState } from "@/types/action";
import type { SeriesListResponse } from "@/features/series/types/series";

export async function fetchSeriesList(
  input: SeriesListFilterInput,
): Promise<ActionState<SeriesListResponse>> {
  try {
    const parsed = SeriesListFilterSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: { code: "VALIDATION_ERROR", message: "Parameter filter tidak valid" },
      };
    }

    const { page, perPage, sort, kategori, ustadz, type } = parsed.data;
    const result = await _getSeriesList(page, perPage, {
      categoryId: kategori,
      speakerId: ustadz,
      seriesTypeId: type,
      sort,
    });

    return { ok: true, data: result };
  } catch (error) {
    if (error instanceof Error) {
      return { ok: false, error: { code: "UNKNOWN_ERROR", message: error.message } };
    }
    return { ok: false, error: { code: "UNKNOWN_ERROR", message: "Gagal memuat daftar series" } };
  }
}
