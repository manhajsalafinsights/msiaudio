import * as authRepository from "@/features/auth/repositories/auth-repository";
import { toAuthErrorMessage } from "@/features/auth/services/error-map";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/features/auth/validation/password.schema";
import type { AuthResult, ResetPasswordInput } from "@/features/auth/types/auth";

/**
 * PasswordService — forgot & reset password.
 * Email belum benar-benar dikirim: Better Auth memanggil callback
 * sendResetPassword yang hanya log (lihat lib/auth/server.ts).
 */

export async function forgotPassword(email: string): Promise<AuthResult> {
  const parsed = forgotPasswordSchema.safeParse({ email });
  if (!parsed.success) {
    return { status: "error", message: "Format email tidak valid." };
  }

  try {
    await authRepository.requestPasswordReset(parsed.data.email);
    // Selalu sukses (anti user-enumeration) — pesan dipisah di halaman.
    return { status: "success" };
  } catch (error) {
    return { status: "error", message: toAuthErrorMessage(error, "Gagal memproses permintaan.") };
  }
}

export async function resetPassword(input: ResetPasswordInput): Promise<AuthResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: "Periksa kembali isian Anda." };
  }

  try {
    await authRepository.resetPassword(parsed.data.token, parsed.data.password);
    return { status: "success" };
  } catch (error) {
    return {
      status: "error",
      message: toAuthErrorMessage(error, "Gagal mengatur ulang password."),
    };
  }
}
