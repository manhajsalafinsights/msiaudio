import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { AppShell } from "@/components/layouts/app-shell";
import { ProfileSidebar } from "@/components/layouts/profile-sidebar";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

/**
 * Layout area USER (/user/*).
 * Hanya role USER yang boleh masuk. ADMIN/SUPER_ADMIN diarahkan ke admin.
 */
export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/user/dashboard");
  }
  if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
    redirect("/admin/dashboard");
  }
  return <AppShell sidebar={<ProfileSidebar />}>{children}</AppShell>;
}
