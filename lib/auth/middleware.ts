import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Helper edge proxy untuk auth.
 * Hanya memeriksa keberadaan cookie session TANPA akses DB (lihat
 * architecture.md §11). Verifikasi nyata selalu di Server Component
 * (layout/halaman) via lib/auth/session.ts.
 */
export function getSessionTokenFromRequest(request: NextRequest): string | null {
  return getSessionCookie(request);
}
