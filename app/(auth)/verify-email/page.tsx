import type { Metadata } from "next";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = { title: "Verifikasi Email" };

export default function VerifyEmailPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Verifikasi Email</CardTitle>
        <CardDescription>
          Halaman verifikasi email sedang dalam persiapan. Fitur pengiriman email belum aktif pada
          fase ini.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted">
          Setelah fitur email aktif, pengguna akan menerima tautan verifikasi di email mereka
          setelah mendaftar.
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href="/login">Kembali ke Halaman Masuk</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
