import Link from "next/link";
import { Headphones } from "lucide-react";
import { site } from "@/lib/config/site";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-8 px-4 py-12">
      <Link href="/" className="flex items-center gap-2" aria-label={site.name}>
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand text-white">
          <Headphones className="h-5 w-5" aria-hidden />
        </span>
        <span className="text-xl font-semibold tracking-tight">{site.name}</span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
