import type { Role, UserStatus } from "@prisma/client";

/**
 * Kontrak AuthAdapter — swappable (NextAuth | Better Auth).
 * Seluruh kode bergantung pada antarmuka ini, bukan pada implementasi
 * library auth tertentu (lihat architecture.md §12).
 * Implementasi aktif: Better Auth (lib/auth/server.ts + features/auth).
 */

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  image: string | null;
  emailVerified: boolean;
  lastLoginAt: Date | null;
};

export type SessionResult =
  { status: "authenticated"; user: SessionUser } | { status: "unauthenticated" };

export interface AuthAdapter {
  signIn(input: { email: string; password: string }): Promise<SessionResult>;
  signUp(input: { name: string; email: string; password: string }): Promise<SessionResult>;
  signOut(): Promise<void>;
  getSessionToken(request: Request): string | null;
  verifySession(token: string): Promise<{ valid: boolean; userId?: string }>;
  getCurrentUser(): Promise<SessionUser | null>;
}
