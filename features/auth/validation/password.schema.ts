import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, "Email wajib diisi").pipe(z.email("Format email tidak valid")),
});

export const resetPasswordFields = z.object({
  token: z.string().min(1, "Token tidak valid"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(128, "Password maksimal 128 karakter"),
  confirmPassword: z.string(),
});

export const resetPasswordFormSchema = resetPasswordFields.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Konfirmasi password tidak sama",
    path: ["confirmPassword"],
  },
);

export const resetPasswordSchema = resetPasswordFields.omit({ confirmPassword: true });

export type ForgotPasswordFormSchema = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormSchema = z.infer<typeof resetPasswordFormSchema>;
