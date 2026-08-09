import { z } from "zod";

const registerFields = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(80, "Nama maksimal 80 karakter"),
  email: z.string().trim().min(1, "Email wajib diisi").pipe(z.email("Format email tidak valid")),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(128, "Password maksimal 128 karakter"),
  confirmPassword: z.string(),
});

/** Skema form register (dengan konfirmasi password). Dipakai di UI (RHF). */
export const registerFormSchema = registerFields.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Konfirmasi password tidak sama",
    path: ["confirmPassword"],
  },
);

/** Skema untuk dikirim ke Better Auth (tanpa confirmPassword). */
export const registerSchema = registerFields.omit({ confirmPassword: true });

export type RegisterFormSchema = z.infer<typeof registerFormSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
