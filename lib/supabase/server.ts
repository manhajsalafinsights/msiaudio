import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/config/env";

/**
 * Supabase admin/service client — SERVER ONLY.
 * Memakai SERVICE_ROLE_KEY: jangan pernah di-import dari client bundle.
 */
export const supabaseAdmin: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);
