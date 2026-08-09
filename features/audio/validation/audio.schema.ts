import { z } from "zod";
import { slugSchema } from "@/validation/common";

export const AudioSlugSchema = slugSchema;

export const AudioSearchSchema = z.object({
  q: z.string().trim().min(1, "Masukkan kata kunci pencarian").max(200),
});

export const AudioListFilterSchema = z.object({
  series: slugSchema.optional(),
  sort: z.enum(["terbaru", "terlama", "judul", "terbanyak"]).default("terbaru"),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(50).default(12),
});

export const AudioDetailSlugSchema = z.object({
  slug: slugSchema,
});

export type AudioListFilterInput = z.infer<typeof AudioListFilterSchema>;
export type AudioSearchInput = z.infer<typeof AudioSearchSchema>;
export type AudioDetailSlugInput = z.infer<typeof AudioDetailSlugSchema>;
