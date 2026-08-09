import { headers } from "next/headers";
import { AuthError, ForbiddenError } from "@/lib/errors/app-error";
import { auth } from "@/lib/auth/server";
import type { SessionUser } from "@/lib/auth/interface";

/**
 * Helper session server (Better Auth).
 * getSession/getCurrentUser untuk layout & halaman; requireUser/requireAdmin
 * untuk server action & service (lihat architecture.md §12.2).
 */

type AuthUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role?: string | null;
  status?: string | null;
  lastLoginAt?: Date | string | null;
};

function toSessionUser(user: AuthUser): SessionUser {
  const role =
    user.role === "ADMIN" ? "ADMIN" : user.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "USER";
  const status = user.status === "INACTIVE" || user.status === "SUSPENDED" ? user.status : "ACTIVE";
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role,
    status,
    image: user.image ?? null,
    emailVerified: user.emailVerified,
    lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : null,
  };
}

export async function getSession(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return null;
  }
  return toSessionUser(session.user as AuthUser);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  return getSession();
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthError();
  }
  if (user.status !== "ACTIVE") {
    throw new ForbiddenError("Akun tidak aktif. Hubungi admin.");
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    throw new ForbiddenError("Hanya admin yang bisa mengakses area ini.");
  }
  return user;
}
