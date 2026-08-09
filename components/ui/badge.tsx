import * as React from "react";
import { cn } from "@/utils/cn";

type BadgeVariant = "brand" | "secondary" | "outline" | "success" | "danger" | "warning";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variants: Record<BadgeVariant, string> = {
  brand: "bg-brand text-white",
  secondary: "bg-brand/10 text-brand-strong dark:text-brand-soft",
  outline: "border border-border text-foreground",
  success: "bg-success/10 text-success",
  danger: "bg-danger/10 text-danger",
  warning: "bg-warning/10 text-warning",
};

export function Badge({ className, variant = "brand", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
