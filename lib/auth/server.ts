import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma/client";
import { env } from "@/lib/config/env";
import { logger } from "@/lib/logger";

/**
 * Instansi Better Auth (server).
 * - Adapter: Prisma (PostgreSQL).
 * - `usePlural: true` → relasi `sessions`/`accounts` (konsisten dengan skema).
 * - `nextCookies()` menulis Set-Cookie otomatis di Server Actions.
 * - Email TIDAK benar-benar dikirim — callback hanya log (fase email menyusul).
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql", usePlural: false }),
  baseURL: env.AUTH_URL ?? env.NEXT_PUBLIC_APP_URL,
  secret: env.AUTH_SECRET,
  trustedOrigins: [env.NEXT_PUBLIC_APP_URL],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
    sendResetPassword: async ({ user, url, token }) => {
      logger.info("[auth] permintaan reset password", { email: user.email, url, token });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }) => {
      logger.info("[auth] verifikasi email", { email: user.email, url, token });
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "USER",
        input: false,
      },
      status: {
        type: "string",
        required: true,
        defaultValue: "ACTIVE",
        input: false,
      },
      lastLoginAt: {
        type: "date",
        required: false,
        input: false,
      },
    },
  },
  plugins: [nextCookies()],
});
