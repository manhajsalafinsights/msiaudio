"use client";

import { Check } from "lucide-react";
import { cn } from "@/utils/cn";

interface CheckboxGroupProps {
  label: string;
  options: { id: string; label: string; sublabel?: string }[];
  selected: string[];
  onChange: (ids: string[]) => void;
}

export function CheckboxGroup({ label, options, selected, onChange }: CheckboxGroupProps) {
  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  };

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium">{label}</legend>
      {options.length === 0 ? (
        <p className="text-xs text-muted">Belum ada opsi. Buat data terlebih dahulu.</p>
      ) : (
        <div className="grid max-h-56 grid-cols-1 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2">
          {options.map((opt) => {
            const active = selected.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                role="checkbox"
                aria-checked={active}
                onClick={() => toggle(opt.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                  active
                    ? "border-brand/40 bg-brand/10 text-brand"
                    : "border-border bg-surface text-foreground hover:border-brand/30",
                )}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
                    active ? "border-brand bg-brand text-white" : "border-border",
                  )}
                >
                  {active && <Check className="h-3 w-3" />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate">{opt.label}</span>
                  {opt.sublabel && <span className="block truncate text-xs text-muted">{opt.sublabel}</span>}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </fieldset>
  );
}
