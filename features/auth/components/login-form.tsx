"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { FormField } from "@/features/auth/components/form-field";
import { loginAction } from "@/features/auth/actions/login";
import { loginSchema, type LoginFormSchema } from "@/features/auth/validation/login.schema";
import { USER_HOME } from "@/lib/auth/role";

type LoginFormProps = {
  /** Redirect setelah berhasil masuk (prioritas). Bila kosong → home sesuai role. */
  next?: string;
};

export function LoginForm({ next }: LoginFormProps) {
  const router = useRouter();
  const [formError, setFormError] = React.useState<string | null>(null);

  const form = useForm<LoginFormSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const {
    handleSubmit,
    register,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (values: LoginFormSchema) => {
    setFormError(null);
    const result = await loginAction({
      email: values.email,
      password: values.password,
      rememberMe: values.rememberMe,
    });
    if (result.status === "error") {
      setFormError(result.message);
      return;
    }
    router.push(next ?? result.redirectTo ?? USER_HOME);
    router.refresh();
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <FormField
          name="email"
          label="Email"
          type="email"
          placeholder="nama@email.com"
          autoComplete="email"
        />
        <FormField
          name="password"
          label="Password"
          type="password"
          placeholder="Masukkan password"
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between gap-2">
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border accent-brand"
              {...register("rememberMe")}
            />
            Ingat saya
          </label>
          <Link href="/forgot-password" className="text-sm text-brand hover:underline">
            Lupa password?
          </Link>
        </div>

        {formError && (
          <p role="alert" className="text-sm text-danger">
            {formError}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Memproses…" : "Masuk"}
        </Button>
      </form>
    </FormProvider>
  );
}
