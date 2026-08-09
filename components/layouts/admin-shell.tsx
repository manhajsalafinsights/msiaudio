"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Headphones,
  LayoutDashboard,
  Mic,
  BookOpen,
  Library,
  ListMusic,
  ListPlus,
  FolderTree,
  Tags,
  ImageIcon,
  Users,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { site } from "@/lib/config/site";
import { ThemeToggle } from "@/components/layouts/theme-toggle";

type AdminNavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const adminNav: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Ustadz", href: "/admin/ustadz", icon: Mic },
  { label: "Kitab", href: "/admin/kitab", icon: BookOpen },
  { label: "Series", href: "/admin/series", icon: Library },
  { label: "Audio", href: "/admin/audio", icon: ListMusic },
  { label: "Import Playlist", href: "/admin/audio/import", icon: ListPlus },
  { label: "Kategori", href: "/admin/kategori", icon: FolderTree },
  { label: "Tag", href: "/admin/tag", icon: Tags },
  { label: "Media", href: "/admin/media", icon: ImageIcon },
  { label: "Pengguna", href: "/admin/pengguna", icon: Users },
  { label: "Pengaturan", href: "/admin/pengaturan", icon: Settings },
];

function AdminSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <Link
        href="/admin/dashboard"
        onClick={onNavigate}
        className="flex h-14 items-center gap-2 border-b border-border px-4"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
          <Headphones className="h-4 w-4" aria-hidden />
        </span>
        <span className="text-sm font-semibold tracking-tight">{site.name}</span>
        <span className="rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-medium text-brand">
          Admin
        </span>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Navigasi admin">
        <ul className="space-y-1">
          {adminNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                    active
                      ? "bg-brand/10 text-brand"
                      : "text-muted hover:bg-border/60 hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-border/60 hover:text-foreground"
        >
          <Headphones className="h-4 w-4 shrink-0" aria-hidden />
          Lihat Situs
        </Link>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 border-r border-border bg-surface lg:block">
        <AdminSidebarContent />
      </aside>

      {/* Sidebar mobile */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} aria-hidden />
          <aside className="absolute inset-y-0 left-0 w-56 border-r border-border bg-surface shadow-lg">
            <button
              type="button"
              aria-label="Tutup menu"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-4 rounded-md p-1 text-muted hover:text-foreground"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
            <AdminSidebarContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-56">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Buka menu"
              onClick={() => setOpen(true)}
              className="rounded-md p-2 text-muted transition-colors hover:bg-border/60 hover:text-foreground lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>
            <span className="text-sm font-medium text-muted">Admin</span>
          </div>
          <ThemeToggle />
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
