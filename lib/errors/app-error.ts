import { ErrorCodes, type ErrorCode } from "@/lib/errors/codes";

/**
 * Error terstruktur untuk seluruh aplikasi.
 * Service melempar AppError; action/route handler menangkapnya dan
 * mengonversi ke respons (tanpa membocorkan detail internal).
 */
export class AppError extends Error {
  readonly status: number;
  readonly code: ErrorCode;

  constructor(status: number, code: ErrorCode, message: string, cause?: unknown) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "AppError";
    this.status = status;
    this.code = code;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, cause?: unknown) {
    super(400, ErrorCodes.VALIDATION, message, cause);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Data tidak ditemukan") {
    super(404, ErrorCodes.NOT_FOUND, message);
  }
}

export class AuthError extends AppError {
  constructor(message = "Tidak terautentikasi") {
    super(401, ErrorCodes.UNAUTHORIZED, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Akses ditolak") {
    super(403, ErrorCodes.FORBIDDEN, message);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Terjadi konflik data") {
    super(409, ErrorCodes.CONFLICT, message);
  }
}

export class ProviderError extends AppError {
  constructor(message = "Layanan eksternal gagal", cause?: unknown) {
    super(502, ErrorCodes.PROVIDER, message, cause);
  }
}
