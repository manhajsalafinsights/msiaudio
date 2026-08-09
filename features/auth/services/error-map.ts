import { APIError } from "better-auth";

/** Peta kode error Better Auth → pesan user yang ramah (Bahasa Indonesia). */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  USER_ALREADY_EXISTS: "Email sudah digunakan. Gunakan email lain.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Email sudah digunakan. Gunakan email lain.",
  INVALID_EMAIL_OR_PASSWORD: "Email atau password salah.",
  EMAIL_NOT_VERIFIED: "Email belum diverifikasi.",
  INVALID_EMAIL: "Format email tidak valid.",
  INVALID_PASSWORD: "Password tidak valid.",
  PASSWORD_TOO_SHORT: "Password terlalu pendek.",
  PASSWORD_TOO_LONG: "Password terlalu panjang.",
  INVALID_TOKEN: "Token tidak valid atau sudah kedaluwarsa.",
  TOKEN_EXPIRED: "Token sudah kedaluwarsa.",
  SESSION_EXPIRED: "Sesi berakhir. Silakan masuk kembali.",
  INVALID_ORIGIN: "Permintaan tidak valid. Muat ulang halaman.",
  CROSS_SITE_NAVIGATION_LOGIN_BLOCKED:
    "Permintaan tidak valid (CSRF). Muat ulang halaman lalu coba lagi.",
  EMAIL_ALREADY_VERIFIED: "Email sudah diverifikasi.",
};

type ApiErrorLike = {
  statusCode: number;
  body?: { code?: string; message?: string };
};

export function isApiError(error: unknown): error is ApiErrorLike {
  return error instanceof APIError;
}

export function getApiErrorCode(error: unknown): string | undefined {
  return isApiError(error) ? error.body?.code : undefined;
}

/**
 * Ubah error apa pun (APIError Better Auth / error lain) menjadi pesan
 * yang aman ditampilkan ke user — tanpa membocorkan detail internal.
 */
export function toAuthErrorMessage(
  error: unknown,
  fallback = "Terjadi kesalahan. Coba lagi.",
): string {
  if (isApiError(error)) {
    const code = error.body?.code;
    if (code && AUTH_ERROR_MESSAGES[code]) {
      return AUTH_ERROR_MESSAGES[code];
    }
    return error.body?.message ?? fallback;
  }
  return fallback;
}
