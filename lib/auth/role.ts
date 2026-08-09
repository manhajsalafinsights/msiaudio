import type { Role } from "@prisma/client";

/**
 * Utilitas role (pure) — aman dipakai dari server maupun client.
 * Home dashboard ditentukan dari role session, bukan nama user.
 */

export const USER_HOME = "/user/dashboard";
export const ADMIN_HOME = "/admin/dashboard";

export function isAdminRole(role?: Role | string | null): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

/** Path dashboard sesuai role (default USER). */
export function homeForRole(role?: Role | string | null): string {
  return isAdminRole(role) ? ADMIN_HOME : USER_HOME;
}

/** Validasi path `next` (hindari open redirect). Undefined bila tidak aman. */
export function safeNextPath(next?: string | null): string | undefined {
  if (!next) return undefined;
  return next.startsWith("/") && !next.startsWith("//") ? next : undefined;
}
