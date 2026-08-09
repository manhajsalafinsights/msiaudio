"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/features/auth/hooks/use-session";

type AuthGuardProps = {
  children: React.ReactNode;
  /** Alihkan ke path ini bila belum login. */
  redirectTo?: string;
};

/** Guard opsional (client) — verifikasi final tetap di Server Component. */
export function AuthGuard({ children, redirectTo = "/login" }: AuthGuardProps) {
  const { data, isPending } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (!isPending && !data) {
      router.replace(redirectTo);
    }
  }, [data, isPending, redirectTo, router]);

  if (isPending) {
    return null;
  }

  return data ? children : null;
}
