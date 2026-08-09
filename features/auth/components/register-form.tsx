"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { FormField } from "@/features/auth/components/form-field";
import { registerAction } from "@/features/auth/actions/register";
import { USER_HOME } from "@/lib/auth/role";
import {
  registerFormSchema,
  type RegisterFormSchema,
} from "@/features/auth/validation/register.schema";

export function RegisterForm() {
  const router = useRouter();
  const [formError, setFormError] = React.useState<string | null>(null);

  const form = useForm<RegisterFormSchema>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (values: RegisterFormSchema) => {
    setFormError(null);
    const result = await registerAction({
      name: values.name,
      email: values.email,
      password: values.password,
    });
    if (result.status === "error") {
      setFormError(result.message);
      return;
    }
    router.push(result.redirectTo ?? USER_HOME);
    router.refresh();
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <FormField name="name" label="Nama" placeholder="Nama lengkap Anda" autoComplete="name" />
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
          placeholder="Minimal 8 karakter"
          autoComplete="new-password"
        />
        <FormField
          name="confirmPassword"
          label="Konfirmasi Password"
          type="password"
          placeholder="Ulangi password"
          autoComplete="new-password"
        />

        {formError && (
          <p role="alert" className="text-sm text-danger">
            {formError}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Memproses…" : "Daftar"}
        </Button>
      </form>
    </FormProvider>
  );
}
