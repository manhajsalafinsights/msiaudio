import Image from "next/image";
import { Headphones } from "lucide-react";
import { cn } from "@/utils/cn";

type KitabCdProps = {
  src?: string | null;
  alt?: string;
  className?: string;
};

/**
 * Cover CD kotak: gambar cover mengisi kartu, di tengah ada lubang bundar
 * transparan (seperti lubang CD) dengan ring alur halus di sekelilingnya.
 */
export function KitabCd({ src, alt, className }: KitabCdProps) {
  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-surface-sunken via-background to-surface-sunken",
        className,
      )}
    >
      {/* Cover CD */}
      <div className="absolute inset-0">
        {src ? (
          <Image
            src={src}
            alt={alt ?? ""}
            fill
            sizes="(min-width: 768px) 25vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-brand to-brand-strong">
            <Headphones className="h-12 w-12 text-white/90" aria-hidden />
          </div>
        )}
      </div>

      {/* Lubang bundar transparan di tengah, ala CD */}
      <div
        className="relative h-[30%] w-[30%] rounded-full"
        style={{
          boxShadow: "0 0 0 6px rgba(0,0,0,0.28), 0 0 0 10px rgba(255,255,255,0.08)",
        }}
        aria-hidden
      >
        {/* Ring alur halus */}
        <div className="absolute inset-[10%] rounded-full border border-white/25" aria-hidden />
        <div className="absolute inset-[20%] rounded-full border border-black/25" aria-hidden />
        <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.14), transparent 45%)" }} aria-hidden />
      </div>

      {/* Kilau CD */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.12) 48%, transparent 62%)",
          }}
        />
      </div>
    </div>
  );
}