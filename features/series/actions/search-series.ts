"use server";

import { searchSeries as _searchSeries } from "@/services/series-service";
import {
  type SeriesSearchInput,
  SeriesSearchSchema,
} from "@/features/series/validation/series.schema";
import type { ActionState } from "@/types/action";
import type { SeriesCardData } from "@/features/series/types/series";

export async function searchSeriesAction(
  input: SeriesSearchInput,
): Promise<ActionState<SeriesCardData[]>> {
  try {
    const parsed = SeriesSearchSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: { code: "VALIDATION_ERROR", message: "Kata kunci pencarian wajib diisi" },
      };
    }

    const result = await _searchSeries(parsed.data.q);
    return { ok: true, data: result };
  } catch (error) {
    if (error instanceof Error) {
      return { ok: false, error: { code: "UNKNOWN_ERROR", message: error.message } };
    }
    return { ok: false, error: { code: "UNKNOWN_ERROR", message: "Gagal mencari series" } };
  }
}
