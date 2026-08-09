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
import { RegisterForm } from "@/features/auth/components/register-form";
import { OAuthButtons } from "@/features/auth/components/oauth-buttons";

export const metadata: Metadata = { title: "Daftar" };

export default async function RegisterPage() {
  const session = await getCurrentUser();
  if (session) redirect(homeForRole(session.role));

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Daftar</CardTitle>
        <CardDescription>Buat akun MSI Audio baru.</CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
        <div className="mt-6">
          <OAuthButtons />
        </div>
      </CardContent>
      <CardFooter className="justify-center">
        <Text variant="muted">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-brand hover:underline">
            Masuk
          </Link>
        </Text>
      </CardFooter>
    </Card>
  );
}
