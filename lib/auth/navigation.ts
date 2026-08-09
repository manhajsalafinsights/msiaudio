import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { homeForRole } from "@/lib/auth/role";

/**
 * Helper navigasi berbasis session (server only).
 * Home dashboard ditentukan dari role authenticated session/database.
 */

export async function getRoleHome(): Promise<string> {
  const user = await getCurrentUser();
  return homeForRole(user?.role);
}

/** Redirect ke home sesuai role — untuk rute warisan seperti /dashboard. */
export async function redirectToRoleHome(): Promise<never> {
  redirect(await getRoleHome());
}
