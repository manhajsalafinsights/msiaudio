"use client";

import { useEffect, useState } from "react";

type LocalStorageOptions<T> = {
  key: string;
  initialValue: T;
  /** Normalisasi saat membaca (mis. JSON.parse hasil). */
  deserialize?: (raw: string) => T;
  serialize?: (value: T) => string;
};

/** State tersinkron localStorage (guest progress, preferensi tema, dll). */
export function useLocalStorage<T>({
  key,
  initialValue,
  deserialize = JSON.parse as (raw: string) => T,
  serialize = JSON.stringify,
}: LocalStorageOptions<T>) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? initialValue : deserialize(raw);
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, serialize(value));
    } catch {
      // localStorage tidak tersedia (privacy mode / storage penuh) — abaikan.
    }
  }, [key, value, serialize]);

  return [value, setValue] as const;
}
