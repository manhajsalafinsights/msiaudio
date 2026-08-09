import Link from "next/link";
import { Plus, Library, BookOpen, ListMusic, ImageIcon } from "lucide-react";

const actions = [
  {
    label: "Tambah Ustadz",
    desc: "Pembicara baru",
    href: "/admin/ustadz/new",
    icon: Plus,
  },
  {
    label: "Tambah Kitab",
    desc: "Jenis program baru",
    href: "/admin/kitab/new",
    icon: BookOpen,
  },
  {
    label: "Tambah Series",
    desc: "Kumpulan kajian baru",
    href: "/admin/series/new",
    icon: Library,
  },
  {
    label: "Tambah Audio",
    desc: "Sesi audio baru",
    href: "/admin/audio/new",
    icon: ListMusic,
  },
  {
    label: "Parser Media",
    desc: "Alat URL YouTube",
    href: "/admin/media",
    icon: ImageIcon,
  },
];

export function QuickActions() {
  return (
    <div>
      <h3 className="text-sm font-semibold">Aksi Cepat</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group rounded-xl border border-border bg-surface p-4 transition-colors hover:border-brand/40"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <action.icon className="h-4.5 w-4.5" />
            </span>
            <p className="mt-3 text-sm font-medium group-hover:text-brand">{action.label}</p>
            <p className="mt-0.5 text-xs text-muted">{action.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
