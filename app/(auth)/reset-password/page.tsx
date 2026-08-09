import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { homeForRole } from "@/lib/auth/role";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata: Metadata = { title: "Atur Ulang Password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const session = await getCurrentUser();
  if (session) redirect(homeForRole(session.role));

  const { token } = await searchParams;

  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Token Tidak Ditemukan</CardTitle>
          <CardDescription>
            Tautan pengaturan ulang password tidak lengkap. Minta tautan baru dari halaman{" "}
            <Link href="/forgot-password" className="text-brand hover:underline">
              Lupa Password
            </Link>
            .
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/forgot-password">Kirim Ulang Tautan</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Atur Ulang Password</CardTitle>
        <CardDescription>Masukkan password baru Anda.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm token={token} />
      </CardContent>
      <CardFooter className="justify-center">
        <Link href="/login" className="text-sm text-brand hover:underline">
          Sudah punya akun? Masuk
        </Link>
      </CardFooter>
    </Card>
  );
}
