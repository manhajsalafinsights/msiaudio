"use client";

import { useCallback, useMemo, useState } from "react";

export function useRowSelection<T extends { id: string }>(rows: T[]) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleRow = useCallback((id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) => (prev.length === rows.length ? [] : rows.map((r) => r.id)));
  }, [rows]);

  const clear = useCallback(() => setSelected([]), []);

  const allSelected = useMemo(
    () => rows.length > 0 && selected.length === rows.length,
    [rows.length, selected.length],
  );

  return { selected, toggleRow, toggleAll, clear, allSelected };
}
