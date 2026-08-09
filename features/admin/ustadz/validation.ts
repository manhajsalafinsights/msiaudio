import { z } from "zod";
import { slugSchema } from "@/validation/common";

export const ustadzFormSchema = z.object({
  nama: z.string().trim().min(1, "Nama wajib diisi").max(100, "Maksimal 100 karakter"),
  slug: z
    .string()
    .trim()
    .max(100)
    .refine((v) => v === "" || slugSchema.safeParse(v).success, "Slug tidak valid"),
  foto: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || z.url().safeParse(v).success, "URL foto tidak valid"),
  bio: z.string().trim().max(2000, "Maksimal 2000 karakter"),
  status: z.enum(["ACTIVE", "INACTIVE"], { message: "Status tidak valid" }),
});

export type UstadzFormInput = z.infer<typeof ustadzFormSchema>;
