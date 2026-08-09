import { createAuthClient } from "better-auth/react";

/**
 * Klien Better Auth untuk komponen client.
 * Hanya diimpor dari komponen dengan direktif "use client".
 */
export const authClient = createAuthClient();
