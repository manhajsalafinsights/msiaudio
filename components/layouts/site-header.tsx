"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Headphones, Menu, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { publicNav, site } from "@/lib/config/site";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ThemeToggle } from "@/components/layouts/theme-toggle";
import { useSession } from "@/features/auth/hooks/use-session";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { HeaderSearch } from "@/components/shared/header-search";
import { PemateriDropdown, type SpeakerNavItem } from "@/components/layouts/pemateri-dropdown";
import { homeForRole } from "@/lib/auth/role";

interface SiteHeaderProps {
  speakers: SpeakerNavItem[];
}

export function SiteHeader({ speakers }: SiteHeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session, isPending } = useSession();

  const closeMenu = () => setMenuOpen(false);
  const navItems = publicNav.filter((item) => item.href !== "/pemateri");

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-2 sm:gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label={site.name}>
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-white">
            <Headphones className="h-4 w-4" aria-hidden />
          </span>
          <span className="text-base font-semibold tracking-tight">{site.name}</span>
        </Link>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand/10 text-brand-strong dark:text-brand-soft"
                    : "text-muted hover:bg-border/60 hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <PemateriDropdown speakers={speakers} />
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <HeaderSearch />
          <ThemeToggle />
          {isPending ? null : session ? (
            <>
              <Link
                href={homeForRole((session.user as { role?: string }).role)}
                className="inline-flex min-w-0 max-w-[8rem] truncate text-sm font-medium text-foreground hover:text-brand"
              >
                {session.user.name}
              </Link>
              <LogoutButton className="hidden sm:inline-flex" />
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/login">Masuk</Link>
              </Button>
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link href="/register">Daftar</Link>
              </Button>
            </>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Buka menu navigasi"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </Button>
        </div>
      </Container>

      {menuOpen && (
        <div id="mobile-menu" className="border-t border-border bg-background md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-brand/10 text-brand-strong dark:text-brand-soft"
                      : "text-muted hover:bg-border/60 hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <PemateriDropdown speakers={speakers} mobile onNavigate={closeMenu} />

            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
              {isPending ? null : session ? (
                <LogoutButton />
              ) : (
                <>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/login" onClick={closeMenu}>
                      Masuk
                    </Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/register" onClick={closeMenu}>
                      Daftar
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
