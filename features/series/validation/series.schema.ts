import { z } from "zod";
import { slugSchema } from "@/validation/common";

export const SeriesSlugSchema = slugSchema;

export const SeriesSearchSchema = z.object({
  q: z.string().trim().min(1, "Masukkan kata kunci pencarian").max(200),
});

export const SeriesListFilterSchema = z.object({
  kategori: slugSchema.optional(),
  ustadz: slugSchema.optional(),
  type: slugSchema.optional(),
  sort: z.enum(["terbaru", "terlama", "az", "terbanyak_audio"]).default("terbaru"),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(50).default(12),
});

export const SeriesDetailSlugSchema = z.object({
  slug: slugSchema,
});

export type SeriesListFilterInput = z.infer<typeof SeriesListFilterSchema>;
export type SeriesSearchInput = z.infer<typeof SeriesSearchSchema>;
export type SeriesDetailSlugInput = z.infer<typeof SeriesDetailSlugSchema>;
