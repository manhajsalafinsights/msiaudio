"use server";

import * as authService from "@/features/auth/services/auth-service";
import type { RegisterInput, AuthResult } from "@/features/auth/types/auth";

export async function registerAction(input: RegisterInput): Promise<AuthResult> {
  return authService.register(input);
}
