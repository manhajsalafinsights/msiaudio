"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

export interface SpeakerNavItem {
  id: string;
  nama: string;
  slug: string;
}

interface PemateriDropdownProps {
  speakers: SpeakerNavItem[];
  /** Tampilan untuk panel menu mobile (list statis di bawah tombol). */
  mobile?: boolean;
  onNavigate?: () => void;
}

export function PemateriDropdown({ speakers, mobile = false, onNavigate }: PemateriDropdownProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const active = pathname === "/pemateri" || pathname.startsWith("/pemateri/");
  const menuId = `pemateri-menu-${mobile ? "m" : "d"}`;

  useEffect(() => {
    if (!open || mobile) return;
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, mobile]);

  const go = () => {
    setOpen(false);
    onNavigate?.();
  };

  return (
    <div ref={ref} className={cn("relative", mobile && "mt-1")}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-1 rounded-md text-sm font-medium transition-colors",
          mobile ? "w-full justify-between px-3 py-2" : "px-3 py-2",
          active
            ? "bg-brand/10 text-brand-strong dark:text-brand-soft"
            : "text-muted hover:bg-border/60 hover:text-foreground",
        )}
      >
        Pemateri
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Pilih pemateri"
          className={cn(
            "z-40 overflow-auto rounded-lg border border-border bg-surface p-1 shadow-lg",
            mobile ? "mt-1 max-h-72" : "absolute left-0 top-full mt-2 max-h-80 w-64",
          )}
        >
          <p className="px-2 py-1.5 text-xs font-semibold text-muted">Pilih pemateri</p>
          {speakers.length === 0 ? (
            <p className="px-2 py-2 text-sm text-muted">Belum ada pemateri.</p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {speakers.map((s) => (
                <Link
                  key={s.id}
                  href={`/pemateri/${s.slug}`}
                  role="menuitem"
                  onClick={go}
                  className="truncate rounded-md px-2 py-1.5 text-sm text-muted transition-colors hover:bg-border/60 hover:text-foreground"
                >
                  {s.nama}
                </Link>
              ))}
            </div>
          )}
          <div className="mt-1 border-t border-border pt-1">
            <Link
              href="/pemateri"
              role="menuitem"
              onClick={go}
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-brand hover:bg-brand/10"
            >
              <Users className="h-4 w-4" aria-hidden />
              Semua Pemateri
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
