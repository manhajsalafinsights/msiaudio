import Link from "next/link";
import { Heading } from "@/components/ui/typography";

type SectionHeaderProps = {
  title: string;
  moreHref?: string;
  moreLabel?: string;
};

export function SectionHeader({ title, moreHref, moreLabel = "Lihat semua" }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Heading as="h2">{title}</Heading>
      {moreHref ? (
        <Link href={moreHref} className="text-sm text-brand hover:underline">
          {moreLabel}
        </Link>
      ) : null}
    </div>
  );
}
