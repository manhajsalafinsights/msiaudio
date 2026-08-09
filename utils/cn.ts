import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Gabungkan class Tailwind & tangani konflik (public-pages.md §9). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
