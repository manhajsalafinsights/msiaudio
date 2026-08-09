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
import { Text } from "@/components/ui/typography";
import { getCurrentUser } from "@/lib/auth/session";
import { homeForRole } from "@/lib/auth/role";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata: Metadata = { title: "Lupa Password" };

export default async function ForgotPasswordPage() {
  const session = await getCurrentUser();
  if (session) redirect(homeForRole(session.role));

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Lupa Password</CardTitle>
        <CardDescription>
          Masukkan email Anda untuk menerima tautan pengaturan ulang password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />
      </CardContent>
      <CardFooter className="justify-center">
        <Text variant="muted">
          Ingat password?{" "}
          <Link href="/login" className="text-brand hover:underline">
            Masuk
          </Link>
        </Text>
      </CardFooter>
    </Card>
  );
}
