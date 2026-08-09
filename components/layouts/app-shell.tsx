import * as React from "react";
import { Container } from "@/components/ui/container";

type AppShellProps = {
  /** Sidebar konten profil (nav) — disembunyikan di layar kecil. */
  sidebar?: React.ReactNode;
  children: React.ReactNode;
};

/** Kerangka halaman user login: sidebar kiri + konten. */
export function AppShell({ sidebar, children }: AppShellProps) {
  return (
    <Container size="wide" className="flex flex-1 gap-8 py-8">
      {sidebar && (
        <aside className="hidden w-64 shrink-0 lg:block" aria-label="Navigasi profil">
          {sidebar}
        </aside>
      )}
      <main className="min-w-0 flex-1">{children}</main>
    </Container>
  );
}
