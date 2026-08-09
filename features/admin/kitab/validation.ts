import { z } from "zod";
import { slugSchema } from "@/validation/common";

export const kitabFormSchema = z.object({
  nama: z.string().trim().min(1, "Nama kitab wajib diisi").max(100, "Maksimal 100 karakter"),
  slug: z
    .string()
    .trim()
    .max(100)
    .refine((v) => v === "" || slugSchema.safeParse(v).success, "Slug tidak valid"),
  icon: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || z.url().safeParse(v).success, "URL icon tidak valid"),
  description: z.string().trim().max(2000, "Maksimal 2000 karakter"),
});

export type KitabFormInput = z.infer<typeof kitabFormSchema>;
