import * as React from "react";
import { cn } from "@/utils/cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export function Input({ className, invalid, ...props }: InputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(
        "h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground",
        "placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        invalid && "border-danger focus-visible:ring-danger",
        className,
      )}
      {...props}
    />
  );
}
