"use server";

import { getAudioBySlug as _getAudioBySlug } from "@/services/audio-service";
import {
  type AudioDetailSlugInput,
  AudioDetailSlugSchema,
} from "@/features/audio/validation/audio.schema";
import type { ActionState } from "@/types/action";
import type { AudioWithDetails } from "@/features/audio/types/audio";

export async function fetchAudioBySlug(
  input: AudioDetailSlugInput,
): Promise<ActionState<AudioWithDetails>> {
  try {
    const parsed = AudioDetailSlugSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: { code: "VALIDATION_ERROR", message: "Slug audio tidak valid" },
      };
    }

    const audio = await _getAudioBySlug(parsed.data.slug);
    return { ok: true, data: audio };
  } catch (error) {
    if (error instanceof Error) {
      return { ok: false, error: { code: "UNKNOWN_ERROR", message: error.message } };
    }
    return { ok: false, error: { code: "UNKNOWN_ERROR", message: "Gagal memuat audio" } };
  }
}
