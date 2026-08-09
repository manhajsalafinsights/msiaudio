import { z } from "zod";
import { slugSchema } from "@/validation/common";

export const seriesFormSchema = z.object({
  judul: z.string().trim().min(1, "Judul wajib diisi").max(200, "Maksimal 200 karakter"),
  slug: z
    .string()
    .trim()
    .max(100)
    .refine((v) => v === "" || slugSchema.safeParse(v).success, "Slug tidak valid"),
  cover: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || z.url().safeParse(v).success, "URL cover tidak valid"),
  deskripsi: z.string().trim().max(5000, "Maksimal 5000 karakter"),
  seriesTypeId: z.string().min(1, "Pilih kitab / jenis kajian"),
  published: z.boolean(),
  speakerIds: z.array(z.string()),
  categoryIds: z.array(z.string()),
  tagIds: z.array(z.string()),
});

export type SeriesFormInput = z.infer<typeof seriesFormSchema>;
