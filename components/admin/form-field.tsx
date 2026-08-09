import * as React from "react";
import { cn } from "@/utils/cn";

interface FieldErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
  message?: string;
}

export function FieldError({ message, className, ...props }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p role="alert" className={cn("text-xs text-danger", className)} {...props}>
      {message}
    </p>
  );
}

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, required, error, hint, children, className }: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-sm font-medium">{label}{required && <span className="ml-0.5 text-danger">*</span>}</label>
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      <FieldError message={error} />
    </div>
  );
}
