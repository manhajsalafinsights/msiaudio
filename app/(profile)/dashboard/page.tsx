import { redirectToRoleHome } from "@/lib/auth/navigation";

/** Rute warisan — arahkan ke dashboard sesuai role session. */
export default async function DashboardRedirectPage() {
  await redirectToRoleHome();
}
