"use server";

import * as authService from "@/features/auth/services/auth-service";
import type { LoginInput, AuthResult } from "@/features/auth/types/auth";

export async function loginAction(input: LoginInput): Promise<AuthResult> {
  return authService.login(input);
}
