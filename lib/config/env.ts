import { z } from "zod";

const logLevelSchema = z.enum(["debug", "info", "warn", "error"]);

const envSchema = z.object({
  DATABASE_URL: z.url(),
  DIRECT_URL: z.url().optional(),
  SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  AUTH_SECRET: z.string().min(1).optional(),
  AUTH_URL: z.url().optional(),
  NEXT_PUBLIC_APP_URL: z.url(),
  LOG_LEVEL: logLevelSchema.default("info"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(
    `[env] Konfigurasi environment tidak valid:\n${issues}\nPeriksa file .env / .env.local.`,
  );
}

export const env = parsed.data;
