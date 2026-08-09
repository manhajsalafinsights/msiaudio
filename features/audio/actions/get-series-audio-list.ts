"use server";

import { getSeriesAudioList as _getSeriesAudioList } from "@/services/audio-service";
import {
  type AudioListFilterInput,
  AudioListFilterSchema,
} from "@/features/audio/validation/audio.schema";
import type { ActionState } from "@/types/action";
import type { AudioListItem } from "@/features/audio/types/audio";

export async function fetchSeriesAudioList(
  input: { seriesId: string } & AudioListFilterInput,
): Promise<ActionState<AudioListItem[]>> {
  try {
    const { seriesId, ...filterInput } = input;
    if (!seriesId || typeof seriesId !== "string") {
      return {
        ok: false,
        error: { code: "VALIDATION_ERROR", message: "ID series tidak valid" },
      };
    }

    const parsed = AudioListFilterSchema.safeParse(filterInput);
    if (!parsed.success) {
      return {
        ok: false,
        error: { code: "VALIDATION_ERROR", message: "Parameter filter tidak valid" },
      };
    }

    const result = await _getSeriesAudioList(seriesId);
    return { ok: true, data: result };
  } catch (error) {
    if (error instanceof Error) {
      return { ok: false, error: { code: "UNKNOWN_ERROR", message: error.message } };
    }
    return { ok: false, error: { code: "UNKNOWN_ERROR", message: "Gagal memuat daftar audio" } };
  }
}
