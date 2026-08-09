import Link from "next/link";
import { Headphones } from "lucide-react";
import { footerLinks, site } from "@/lib/config/site";
import { Container } from "@/components/ui/container";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <Container className="flex flex-col gap-6 py-10 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand text-white">
            <Headphones className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold">{site.name}</p>
            <p className="mt-0.5 max-w-xs text-xs text-muted">{site.tagline}</p>
          </div>
        </div>

        <nav aria-label="Tautan footer" className="flex flex-wrap gap-x-6 gap-y-2">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </Container>
      <div className="border-t border-border">
        <Container className="py-4">
          <p className="text-xs text-muted">
            © {year} {site.name}. Hak cipta dilindungi.
          </p>
        </Container>
      </div>
    </footer>
  );
}
