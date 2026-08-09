import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

export type Crumb = {
  label: string;
  href?: string;
};

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 overflow-hidden">
      <ol className="flex items-center gap-1 text-sm text-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex min-w-0 items-center gap-1">
              {index > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />}
              {item.href && !isLast ? (
                <Link href={item.href} className="truncate transition-colors hover:text-foreground">
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className={cn("truncate", isLast && "text-foreground")}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
