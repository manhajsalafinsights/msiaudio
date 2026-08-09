/**
 * Kode error terpusat — dipakai di AppError, ActionState, dan respons API.
 */
export const ErrorCodes = {
  VALIDATION: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  CONFLICT: "CONFLICT",
  PROVIDER: "PROVIDER_ERROR",
  INTERNAL: "INTERNAL_ERROR",
  AUTH_NOT_IMPLEMENTED: "AUTH_NOT_IMPLEMENTED",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
