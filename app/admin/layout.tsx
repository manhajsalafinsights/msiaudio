import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { AdminShell } from "@/components/layouts/admin-shell";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/admin/dashboard");
  }
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    redirect("/user/dashboard");
  }
  return <AdminShell>{children}</AdminShell>;
}
