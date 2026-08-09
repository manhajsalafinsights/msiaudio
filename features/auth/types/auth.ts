import type { SessionUser } from "@/lib/auth/interface";

export type { SessionUser };

/** Hasil aksi auth yang dikembalikan ke komponen form (client). */
export type AuthResult =
  | { status: "success"; redirectTo?: string }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> };

export type LoginInput = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type ResetPasswordInput = {
  token: string;
  newPassword: string;
};
