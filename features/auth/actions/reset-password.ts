"use server";

import * as passwordService from "@/features/auth/services/password-service";
import type { ResetPasswordInput, AuthResult } from "@/features/auth/types/auth";

export async function resetPasswordAction(input: ResetPasswordInput): Promise<AuthResult> {
  return passwordService.resetPassword(input);
}
