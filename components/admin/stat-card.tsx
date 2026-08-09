import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  sub?: string;
  href?: string;
}

export function StatCard({ title, value, icon, sub, href }: StatCardProps) {
  const content = (
    <div className="card card-outlined p-5 transition-colors group-hover:border-brand/40">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
          {icon}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-2xl font-bold tabular-nums">{value.toLocaleString("id-ID")}</span>
          {href && <ArrowUpRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}
        </div>
      </div>
      <p className="mt-3 text-sm font-medium">{title}</p>
      {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50">
      {content}
    </Link>
  );
}
