"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  History,
  Bookmark,
  StickyNote,
  Heart,
  User,
  Settings,
  Home,
} from "lucide-react";
import { cn } from "@/utils/cn";

const NAV_ITEMS = [
  { href: "/user/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/user/dashboard/history", label: "Riwayat", icon: History },
  { href: "/user/dashboard/bookmarks", label: "Bookmark", icon: Bookmark },
  { href: "/user/dashboard/notes", label: "Catatan", icon: StickyNote },
  { href: "/user/dashboard/favorites", label: "Favorit", icon: Heart },
  { href: "/user/dashboard/profile", label: "Profil", icon: User },
  { href: "/user/dashboard/settings", label: "Pengaturan", icon: Settings },
];

export function ProfileSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1" aria-label="Navigasi akun">
      <Link
        href="/"
        className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-border/40 hover:text-foreground"
      >
        <Home className="h-4 w-4" />
        Kembali ke Beranda
      </Link>
      <div className="my-1 border-t border-border" />
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-border/40 hover:text-foreground",
              isActive && "bg-brand/10 text-brand"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
