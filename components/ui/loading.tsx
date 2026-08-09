import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

type LoadingProps = {
  label?: string;
  className?: string;
};

/** Indikator loading inline (baris konten, tombol, dsb). */
export function Loading({ label = "Memuat…", className }: LoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex items-center justify-center gap-2 text-muted", className)}
    >
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
      <span className="text-sm">{label}</span>
    </div>
  );
}

/** Layar loading penuh — pasangan route segment `loading.tsx`. */
export function LoadingScreen({ label = "Memuat…", className }: LoadingProps) {
  return (
    <div className={cn("flex min-h-[60vh] items-center justify-center", className)}>
      <Loading label={label} />
    </div>
  );
}
