import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Heading } from "@/components/ui/typography";

type SectionHeaderProps = {
  title: string;
  moreHref?: string;
  moreLabel?: string;
};

export function SectionHeader({ title, moreHref, moreLabel = "Lihat semua" }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 pb-4">
      <Heading as="h2" className="text-2xl font-bold tracking-tight md:text-3xl">
        {title}
      </Heading>
      {moreHref ? (
        <Link
          href={moreHref}
          className="group inline-flex items-center gap-1 text-sm font-semibold text-secondary transition-colors hover:text-foreground"
        >
          {moreLabel}
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      ) : null}
    </div>
  );
}