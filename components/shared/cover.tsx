import Image from "next/image";
import { Headphones } from "lucide-react";
import { cn } from "@/utils/cn";

type CoverProps = {
  src?: string | null;
  alt: string;
  /** Ukuran kartu: `card` (16:9) atau `square` (1:1, avatar/cover series). */
  variant?: "card" | "square";
  className?: string;
};

export function Cover({ src, alt, variant = "card", className }: CoverProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg",
        variant === "card" ? "aspect-video" : "aspect-square",
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover"
        />
      ) : (
        <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-brand to-brand-strong">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.25) 0%, transparent 45%)",
            }}
            aria-hidden
          />
          <Headphones
            className={cn(
              "relative text-white/90",
              variant === "card" ? "h-10 w-10" : "h-9 w-9",
            )}
            aria-hidden
          />
        </div>
      )}
    </div>
  );
}
