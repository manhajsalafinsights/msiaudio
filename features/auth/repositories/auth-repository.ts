import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma/client";
import type { LoginInput, RegisterInput } from "@/features/auth/types/auth";

/**
 * AuthRepository — satu-satunya akses data untuk autentikasi.
 * Operasi utama (sign in / sign up / session) didelegasikan ke Better Auth;
 * query user tambahan memakai Prisma langsung.
 */
export async function signIn(input: LoginInput) {
  return auth.api.signInEmail({ body: input });
}

export async function signUp(input: RegisterInput) {
  return auth.api.signUpEmail({ body: input });
}

export async function signOut() {
  return auth.api.signOut({ headers: await headers() });
}

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function updateLastLogin(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  });
}

export async function requestPasswordReset(email: string) {
  return auth.api.requestPasswordReset({ body: { email } });
}

export async function resetPassword(token: string, newPassword: string) {
  return auth.api.resetPassword({ body: { token, newPassword } });
}
