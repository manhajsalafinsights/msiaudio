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
import { homeForRole, safeNextPath } from "@/lib/auth/role";
import { LoginForm } from "@/features/auth/components/login-form";
import { OAuthButtons } from "@/features/auth/components/oauth-buttons";

export const metadata: Metadata = { title: "Masuk" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getCurrentUser();
  if (session) redirect(homeForRole(session.role));

  const { next } = await searchParams;
  const safeNext = safeNextPath(next);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Masuk</CardTitle>
        <CardDescription>Masuk ke akun MSI Audio Anda.</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm next={safeNext} />
        <div className="mt-6">
          <OAuthButtons />
        </div>
      </CardContent>
      <CardFooter className="justify-center">
        <Text variant="muted">
          Belum punya akun?{" "}
          <Link href="/register" className="text-brand hover:underline">
            Daftar
          </Link>
        </Text>
      </CardFooter>
    </Card>
  );
}
