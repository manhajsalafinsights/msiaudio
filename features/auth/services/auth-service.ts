import { z } from "zod";
import * as authRepository from "@/features/auth/repositories/auth-repository";
import { toAuthErrorMessage } from "@/features/auth/services/error-map";
import { homeForRole } from "@/lib/auth/role";
import { loginSchema } from "@/features/auth/validation/login.schema";
import { registerSchema } from "@/features/auth/validation/register.schema";
import type { LoginInput, RegisterInput, AuthResult } from "@/features/auth/types/auth";

/**
 * AuthService — business logic autentikasi.
 * Menerima input mentah, memvalidasi (Zod), lalu memanggil repository.
 * Semua error dipetakan ke pesan user yang aman (tanpa detail internal).
 */

function zodErrorToFieldErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (key) {
      fieldErrors[key] = fieldErrors[key] ?? [];
      fieldErrors[key].push(issue.message);
    }
  }
  return fieldErrors;
}

function errorResult(error: unknown, fallback: string): AuthResult {
  return { status: "error", message: toAuthErrorMessage(error, fallback) };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Periksa kembali isian Anda.",
      fieldErrors: zodErrorToFieldErrors(parsed.error),
    };
  }
  const { email } = parsed.data;

  const existing = await authRepository.getUserByEmail(email);
  if (existing && existing.status !== "ACTIVE") {
    return { status: "error", message: "Akun tidak aktif. Hubungi admin." };
  }

  try {
    const result = await authRepository.signIn(parsed.data);
    if (result && result.user?.id) {
      await authRepository.updateLastLogin(result.user.id).catch(() => {});
    }
    return { status: "success", redirectTo: homeForRole(result?.user?.role) };
  } catch (error: unknown) {
    return errorResult(error, "Email atau password salah.");
  }
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Periksa kembali isian Anda.",
      fieldErrors: zodErrorToFieldErrors(parsed.error),
    };
  }

  try {
    const result = await authRepository.signUp(parsed.data);
    return { status: "success", redirectTo: homeForRole(result?.user?.role) };
  } catch (error: unknown) {
    return errorResult(error, "Gagal membuat akun. Coba lagi.");
  }
}

export async function logout(): Promise<AuthResult> {
  try {
    await authRepository.signOut();
    return { status: "success" };
  } catch (error: unknown) {
    return errorResult(error, "Gagal keluar. Coba lagi.");
  }
}
