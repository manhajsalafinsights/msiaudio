"use server";

import { searchAudio as _searchAudio } from "@/services/audio-service";
import { type AudioSearchInput, AudioSearchSchema } from "@/features/audio/validation/audio.schema";
import type { ActionState } from "@/types/action";
import type { AudioCardData } from "@/features/audio/types/audio";

export async function searchAudioAction(
  input: AudioSearchInput,
): Promise<ActionState<AudioCardData[]>> {
  try {
    const parsed = AudioSearchSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: { code: "VALIDATION_ERROR", message: "Kata kunci pencarian wajib diisi" },
      };
    }

    const result = await _searchAudio(parsed.data.q);
    return { ok: true, data: result };
  } catch (error) {
    if (error instanceof Error) {
      return { ok: false, error: { code: "UNKNOWN_ERROR", message: error.message } };
    }
    return { ok: false, error: { code: "UNKNOWN_ERROR", message: "Gagal mencari audio" } };
  }
}
