import { Headphones, Music } from "lucide-react";
import { Cover } from "@/components/shared/cover";
import { cn } from "@/utils/cn";

type AudioBookProps = {
  src?: string | null;
  alt?: string;
  className?: string;
  /** Sembunyikan badge ikon musik (untuk ukuran mini). */
  hideBadge?: boolean;
};

/**
 * Buku (kitab) terbuka yang mengambang pelan — cover audio tampil di halaman
 * kiri, halaman kanan berupa kertas dengan baris teks samar.
 */
export function AudioBook({ src, alt, className, hideBadge = false }: AudioBookProps) {
  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-surface-sunken via-background to-surface-sunken",
        className,
      )}
      aria-hidden
    >
      <div className="absolute inset-8 rounded-full bg-brand/10 blur-2xl" aria-hidden />

      <div className="relative h-[80%] w-[86%] animate-float motion-reduce:animate-none">
        {/* Halaman kiri = cover audio */}
        <div
          className="absolute inset-y-0 left-0 w-[52%] overflow-hidden rounded-l-lg shadow-[0_18px_40px_-12px_rgba(0,0,0,0.5)]"
          style={{
            transform: "perspective(900px) rotateY(8deg)",
            transformOrigin: "right center",
          }}
        >
          {src ? (
            <Cover src={src} alt={alt ?? ""} variant="square" className="h-full w-full" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand to-brand-strong">
              <Headphones className="h-2/5 w-2/5 text-white/90" aria-hidden />
            </div>
          )}
        </div>

        {/* Halaman kanan = kertas */}
        <div
          className="absolute inset-y-0 right-0 w-[50%] overflow-hidden rounded-r-lg bg-[#f6f1e7] shadow-[0_18px_40px_-12px_rgba(0,0,0,0.45)]"
          style={{
            transform: "perspective(900px) rotateY(-10deg)",
            transformOrigin: "left center",
          }}
        >
          <div className="flex h-full flex-col justify-center gap-2 px-4">
            <div className="h-1.5 w-[70%] rounded-full bg-black/15" />
            <div className="h-1.5 w-[85%] rounded-full bg-black/15" />
            <div className="h-1.5 w-[60%] rounded-full bg-black/15" />
            <div className="h-1.5 w-[80%] rounded-full bg-black/15" />
            <div className="h-1.5 w-[45%] rounded-full bg-black/15" />
          </div>
        </div>

        {/* Tulang buku (spine) */}
        <div
          className="absolute inset-y-0 left-1/2 w-[7%] -translate-x-1/2 bg-gradient-to-r from-black/30 via-black/10 to-transparent"
          aria-hidden
        />
      </div>

      {/* Kilau statis (di luar buku agar tidak ikut bergerak) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden>
        <div
          className="absolute -left-1/3 -top-1/3 h-[130%] w-[70%] rotate-[24deg] opacity-20"
          style={{
            background:
              "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.8) 50%, transparent 70%)",
          }}
        />
      </div>

      {/* Ikon musik pojok kanan atas */}
      {!hideBadge && (
        <span className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-brand/90 text-white shadow-sm backdrop-blur-sm">
          <Music className="h-3.5 w-3.5" aria-hidden />
        </span>
      )}
    </div>
  );
}