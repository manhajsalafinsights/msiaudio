import { supabaseAdmin } from "@/lib/supabase/server";

export const COVER_BUCKET = "msi-covers";

function coverPublicUrlPrefix() {
  const { data } = supabaseAdmin.storage.from(COVER_BUCKET).getPublicUrl("__prefix__");
  return data.publicUrl.replace("__prefix__", "");
}

export function isManagedCoverUrl(url: string) {
  return url.startsWith(coverPublicUrlPrefix());
}

export async function deleteCoverByUrl(url: string) {
  if (!url || !isManagedCoverUrl(url)) return;
  const path = url.replace(coverPublicUrlPrefix(), "");
  await supabaseAdmin.storage.from(COVER_BUCKET).remove([path]);
}

/**
 * Hapus file lama milik bucket saat URL cover berubah (update actions).
 */
export async function cleanupCover(oldUrl: string | null, newUrl: string | null) {
  if (oldUrl && oldUrl !== newUrl) {
    await deleteCoverByUrl(oldUrl);
  }
}
