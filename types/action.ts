/**
 * Bentuk kembalian seragam untuk semua server action (architecture.md §15.2).
 */
export type ActionState<T = undefined> =
  { ok: true; data: T } | { ok: false; error: { code: string; message: string } };

export type ActionError = Extract<ActionState, { ok: false }>["error"];
