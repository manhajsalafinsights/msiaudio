"use client";

import { Search } from "lucide-react";
import { cn } from "@/utils/cn";
import { Input } from "@/components/ui/input";

type SearchInputProps = {
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  name?: string;
  autoComplete?: string;
  autoFocus?: boolean;
};

export function SearchInput({
  defaultValue = "",
  placeholder = "Cari series...",
  className,
  name = "q",
  autoComplete = "off",
  autoFocus = false,
}: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
      <Input
        type="search"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        className="pl-10"
      />
    </div>
  );
}
