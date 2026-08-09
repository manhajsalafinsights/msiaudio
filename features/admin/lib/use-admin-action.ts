"use client";

import { useState, useTransition } from "react";
import type { ActionState } from "@/types/action";

/**
 * Helper untuk table admin: menjalankan server action, lalu menampilkan
 * pesan error bila gagal (action mengembalikan { ok: false }).
 */
export function useAdminAction(refresh: () => void) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (fn: () => Promise<ActionState>, cleanup?: () => void) => {
    startTransition(async () => {
      setError(null);
      const result = await fn();
      if (!result.ok) {
        setError(result.error.message);
      }
      cleanup?.();
      refresh();
    });
  };

  return { pending, error, run };
}
