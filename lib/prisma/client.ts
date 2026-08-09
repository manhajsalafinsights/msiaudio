import { PrismaClient } from "@prisma/client";

/**
 * Singleton PrismaClient.
 * Disimpan di globalThis agar tidak membuat koneksi baru pada setiap
 * hot-reload saat development (best practice untuk Next.js).
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
