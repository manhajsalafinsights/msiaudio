import Image from "next/image";
import { Headphones } from "lucide-react";
import { cn } from "@/utils/cn";

type KitabBookProps = {
  src?: string | null;
  alt?: string;
  className?: string;
};

/**
 * Buku tebal tertutup: sampul depan (cover), punggung kulit di kiri, dan
 * tumpukan halaman tebal di sisi kanan — mengambang pelan.
 */
export function KitabBook({ src, alt, className }: KitabBookProps) {
  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-surface-sunken via-background to-surface-sunken",
        className,
      )}
      aria-hidden
    >
      <div className="absolute inset-8 rounded-full bg-brand/10 blur-2xl" aria-hidden />

      <div
        className="relative h-[84%] w-[70%] animate-float motion-reduce:animate-none"
        style={{ transform: "perspective(1100px) rotateY(-6deg)" }}
      >
        {/* Blok halaman (kesan tebal) */}
        <div
          className="absolute inset-y-[1%] right-[-2%] w-[16%] rounded-r-md"
          style={{
            background:
              "repeating-linear-gradient(90deg, #f2ead9 0px, #f2ead9 2.5px, #d8cbb0 2.5px, #d8cbb0 3.5px)",
            boxShadow: "0 20px 45px -14px rgba(0,0,0,0.55)",
            transform: "perspective(900px) rotateY(-18deg)",
            transformOrigin: "left center",
          }}
        />

        {/* Punggung buku (spine kulit) */}
        <div className="absolute inset-y-0 left-0 w-[9%] rounded-l-md bg-gradient-to-r from-[#3a2a1a] via-[#5c4228] to-[#3a2a1a] shadow-[inset_-4px_0_8px_rgba(0,0,0,0.35)]" />

        {/* Sampul depan */}
        <div className="absolute inset-y-0 left-[9%] right-0 overflow-hidden rounded-r-md rounded-l-[2px] shadow-[0_20px_45px_-14px_rgba(0,0,0,0.55)]">
          {src ? (
            <Image
              src={src}
              alt={alt ?? ""}
              fill
              sizes="(min-width: 768px) 25vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand to-brand-strong">
              <Headphones className="h-10 w-10 text-white/90" aria-hidden />
            </div>
          )}
          {/* Overlay + bingkai dekoratif ala sampul kitab */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />
          <div className="absolute inset-[7%] rounded-[3px] border-2 border-white/25" />
          <div className="absolute inset-[10%] rounded-[3px] border border-white/15" />
        </div>
      </div>

      {/* Kilau */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)",
          }}
        />
      </div>
    </div>
  );
}