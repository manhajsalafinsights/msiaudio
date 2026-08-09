"use server";

import * as passwordService from "@/features/auth/services/password-service";
import type { AuthResult } from "@/features/auth/types/auth";

export async function forgotPasswordAction(email: string): Promise<AuthResult> {
  return passwordService.forgotPassword(email);
}
