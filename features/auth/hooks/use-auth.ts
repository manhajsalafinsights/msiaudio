"use client";

import { authClient } from "@/lib/auth/client";

export type AuthClientInput = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

/** Helper auth untuk komponen client (login/register/logout + session). */
export function useAuth() {
  const { data, isPending, refetch } = authClient.useSession();
  const user = data?.user ?? null;

  return {
    user,
    isPending,
    isAuthenticated: Boolean(user),
    login: (input: AuthClientInput) => authClient.signIn.email(input),
    register: (input: { name: string; email: string; password: string }) =>
      authClient.signUp.email(input),
    logout: () => authClient.signOut(),
    refetch,
  };
}
