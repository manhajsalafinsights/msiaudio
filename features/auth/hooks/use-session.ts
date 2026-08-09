"use client";

import { authClient } from "@/lib/auth/client";

/** Session reaktif untuk komponen client (nano-stores dari Better Auth). */
export function useSession() {
  return authClient.useSession();
}
