"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";

type FormFieldProps = {
  name: string;
  label: string;
  type?: "text" | "email" | "password";
  placeholder?: string;
  autoComplete?: string;
};

/** Field form RHF: label + input + toggle show-password + pesan error. */
export function FormField({
  name,
  label,
  type = "text",
  placeholder,
  autoComplete,
}: FormFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const [showPassword, setShowPassword] = React.useState(false);
  const error = errors[name];
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <Input
          id={name}
          type={inputType}
          placeholder={placeholder}
          autoComplete={autoComplete}
          invalid={Boolean(error)}
          className={isPassword ? "pr-11" : undefined}
          {...register(name)}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted transition-colors hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {String(error.message)}
        </p>
      )}
    </div>
  );
}
