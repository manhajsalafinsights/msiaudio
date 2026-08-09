import type { Role } from "@prisma/client";

/**
 * Matriks permission per role.
 * Ini murni konfigurasi (tanpa logika). Aksi mutasi tetap mewajibkan
 * pengecekan ulang role di server action / service (defense in depth).
 */
export type Permission = "content:view" | "content:manage" | "user:view" | "system:manage";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  USER: ["content:view"],
  ADMIN: ["content:view", "content:manage", "user:view", "system:manage"],
  SUPER_ADMIN: ["content:view", "content:manage", "user:view", "system:manage"],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}
