"use server";

import * as authService from "@/features/auth/services/auth-service";
import type { AuthResult } from "@/features/auth/types/auth";

export async function logoutAction(): Promise<AuthResult> {
  return authService.logout();
}
