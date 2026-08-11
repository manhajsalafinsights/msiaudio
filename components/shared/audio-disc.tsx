import { Headphones, Music } from "lucide-react";
import { Cover } from "@/components/shared/cover";
import { cn } from "@/utils/cn";

type AudioDiscProps = {
  src?: string | null;
  alt?: string;
  className?: string;
  /** Sembunyikan badge ikon musik (untuk ukuran mini). */
  hideBadge?: boolean;
};

/**
 * Piringan CD yang berputar dengan cover di label tengah — pengganti tampilan
 * cover video (mis. thumbnail YouTube) agar kartu terlihat seperti audio CD.
 */
export function AudioDisc({ src, alt, className, hideBadge = false }: AudioDiscProps) {
  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-surface-sunken via-background to-surface-sunken",
        className,
      )}
      aria-hidden
    >
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.06) 0%, transparent 45%)",
        }}
      />
      <div className="absolute inset-8 rounded-full bg-brand/10 blur-2xl" aria-hidden />

      <div
        className="relative aspect-square h-[76%] animate-spin-slow rounded-full motion-reduce:animate-none"
        style={{ animationDuration: "8s", animationTimingFunction: "linear" }}
      >
        {/* CD body */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 32% 28%, #fdfdfe 0%, #d7dce3 16%, #b4bcc7 32%, #8b95a3 50%, #5c6575 68%, #353b47 84%, #242830 100%)",
          }}
          aria-hidden
        />

        {/* Groove rings */}
        <div className="absolute inset-[5%] rounded-full border border-white/15" aria-hidden />
        <div className="absolute inset-[9%] rounded-full border border-white/10" aria-hidden />
        <div className="absolute inset-[13%] rounded-full border border-black/15" aria-hidden />

        {/* Label (cover) */}
        <div className="absolute inset-[19%] overflow-hidden rounded-full ring-4 ring-black/25">
          {src ? (
            <Cover
              src={src}
              alt={alt ?? ""}
              variant="square"
              className="h-full w-full rounded-full"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-strong">
              <Headphones className="h-2/5 w-2/5 text-white/90" aria-hidden />
            </div>
          )}
        </div>

        {/* Center spindle */}
        <div
          className="absolute left-1/2 top-1/2 h-[22%] w-[22%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-950 ring-4 ring-black/40"
          aria-hidden
        />
      </div>

      {/* Static sheen (di luar disc agar tidak ikut berputar) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden>
        <div
          className="absolute -left-1/3 -top-1/3 h-[130%] w-[70%] rotate-[24deg] opacity-25"
          style={{
            background:
              "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.9) 50%, transparent 70%)",
          }}
        />
      </div>

      {/* Ikon musik pojok kiri atas */}
      {!hideBadge && (
        <span className="absolute left-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-brand/90 text-white shadow-sm backdrop-blur-sm">
          <Music className="h-3.5 w-3.5" aria-hidden />
        </span>
      )}
    </div>
  );
}
