import { z } from "zod";
import { slugSchema } from "@/validation/common";

export const kategoriFormSchema = z.object({
  nama: z.string().trim().min(1, "Nama wajib diisi").max(100, "Maksimal 100 karakter"),
  slug: z
    .string()
    .trim()
    .max(100)
    .refine((v) => v === "" || slugSchema.safeParse(v).success, "Slug tidak valid"),
  icon: z.string().trim().max(200, "Maksimal 200 karakter"),
});

export type KategoriFormInput = z.infer<typeof kategoriFormSchema>;
