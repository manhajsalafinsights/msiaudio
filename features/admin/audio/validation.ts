import { z } from "zod";
import { slugSchema } from "@/validation/common";
import { extractYouTubeVideoId } from "@/utils/media";

export const audioFormSchema = z.object({
  judul: z.string().trim().min(1, "Judul wajib diisi").max(200, "Maksimal 200 karakter"),
  slug: z
    .string()
    .trim()
    .max(100)
    .refine((v) => v === "" || slugSchema.safeParse(v).success, "Slug tidak valid"),
  seriesId: z.string().min(1, "Pilih series"),
  nomorSesi: z.number().int().min(1, "Nomor sesi minimal 1"),
  deskripsi: z.string().trim().max(5000, "Maksimal 5000 karakter"),
  durasi: z
    .number()
    .int()
    .min(0, "Durasi tidak valid")
    .max(86400 * 10, "Durasi terlalu besar"),
  cover: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || z.url().safeParse(v).success, "URL cover tidak valid"),
  published: z.boolean(),
  youtubeUrl: z
    .string()
    .trim()
    .max(500)
    .refine(
      (v) => v === "" || extractYouTubeVideoId(v) !== null,
      "URL YouTube tidak valid. Gunakan format youtube.com/watch?v=... atau youtu.be/...",
    ),
});

export type AudioFormInput = z.infer<typeof audioFormSchema>;
