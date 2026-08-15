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
    <div className="card card-outlined min-w-0 p-4 transition-colors group-hover:border-brand/40 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand sm:h-10 sm:w-10">
          {icon}
        </div>
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-xl font-bold tabular-nums sm:text-2xl">
            {value.toLocaleString("id-ID")}
          </span>
          {href && <ArrowUpRight className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}
        </div>
      </div>
      <p className="mt-3 truncate text-sm font-medium">{title}</p>
      {sub && <p className="mt-0.5 text-xs leading-snug text-muted">{sub}</p>}
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50">
      {content}
    </Link>
  );
}
