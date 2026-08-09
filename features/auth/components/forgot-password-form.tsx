"use client";

import * as React from "react";
import { useState } from "react";
import { forgotPasswordAction } from "@/features/auth/actions/forgot-password";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string | undefined;
    const result = await forgotPasswordAction(email ?? "");
    setIsPending(false);
    if (result.status === "error") {
      setError(result.message);
      return;
    }
    setMessage("Jika email terdaftar, cek email Anda untuk tautan pengaturan ulang password.");
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="nama@email.com"
          autoComplete="email"
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
        {isPending ? "Memproses…" : "Kirim Tautan"}
      </Button>
    </form>
  );
}
