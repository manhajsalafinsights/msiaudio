"use client";

import * as React from "react";
import { useState } from "react";
import { resetPasswordAction } from "@/features/auth/actions/reset-password";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ResetPasswordForm({ token }: { token: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string | undefined;
    const result = await resetPasswordAction({ token, newPassword: password ?? "" });
    setIsPending(false);
    if (result.status === "error") {
      setError(result.message);
      return;
    }
    setMessage("Password berhasil diperbarui. Silakan masuk dengan password baru.");
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          Password Baru
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Minimal 8 karakter"
          autoComplete="new-password"
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
          Konfirmasi Password
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Ulangi password"
          autoComplete="new-password"
          required
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="text-sm text-success">
          {message}
        </p>
      )}
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Memproses…" : "Perbarui Password"}
      </Button>
    </form>
  );
}
