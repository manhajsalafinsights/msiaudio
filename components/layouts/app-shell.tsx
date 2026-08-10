"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X, Headphones } from "lucide-react";
import { Container } from "@/components/ui/container";
import { site } from "@/lib/config/site";

type AppShellProps = {
  /** Sidebar konten profil (nav) — disembunyikan di layar kecil. */
  sidebar?: React.ReactNode;
  children: React.ReactNode;
};

/** Kerangka halaman user login: sidebar kiri (desktop) / drawer (mobile) + konten. */
export function AppShell({ sidebar, children }: AppShellProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex flex-1 flex-col">
      {sidebar && (
        <>
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6 lg:hidden">
            <Link
              href="/"
              className="flex shrink-0 items-center gap-2"
              aria-label={`${site.name} — kembali ke beranda`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-white">
                <Headphones className="h-4 w-4" aria-hidden />
              </span>
            </Link>
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-muted">Menu Akun</span>
              <button
                type="button"
                aria-label="Buka menu akun"
                aria-expanded={open}
                onClick={() => setOpen(true)}
                className="rounded-md p-2 text-muted transition-colors hover:bg-border/60 hover:text-foreground"
              >
                <Menu className="h-5 w-5" aria-hidden />
              </button>
            </div>
          </header>

          {open && (
            <div className="fixed inset-0 z-40 lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} aria-hidden />
              <aside className="absolute inset-y-0 left-0 w-64 border-r border-border bg-surface shadow-lg">
                <div className="flex h-12 items-center justify-end px-3">
                  <button
                    type="button"
                    aria-label="Tutup menu"
                    onClick={() => setOpen(false)}
                    className="rounded-md p-1 text-muted transition-colors hover:bg-border/60 hover:text-foreground"
                  >
                    <X className="h-5 w-5" aria-hidden />
                  </button>
                </div>
                <div className="px-3 pb-6" onClick={() => setOpen(false)}>
                  {sidebar}
                </div>
              </aside>
            </div>
          )}
        </>
      )}

      <Container size="wide" className="flex flex-1 gap-8 px-5 py-6 sm:py-8">
        {sidebar && (
          <aside className="hidden w-64 shrink-0 lg:block" aria-label="Navigasi profil">
            {sidebar}
          </aside>
        )}
        <main className="min-w-0 flex-1">{children}</main>
      </Container>
    </div>
  );
}
