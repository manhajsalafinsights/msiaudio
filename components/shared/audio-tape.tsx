import { Music } from "lucide-react";
import { Cover } from "@/components/shared/cover";
import { cn } from "@/utils/cn";

type AudioTapeProps = {
  src?: string | null;
  alt?: string;
  className?: string;
};

/**
 * Kaset pita dengan dua roda yang berputar — pengganti cover series
 * agar sumber (mis. thumbnail YouTube) tidak terlihat mentah.
 * Cover tampil di jendela label kaset.
 */
export function AudioTape({ src, alt, className }: AudioTapeProps) {
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
      <div className="absolute inset-8 rounded-2xl bg-brand/10 blur-2xl" aria-hidden />

      {/* Cangkang kaset */}
      <div className="relative flex h-[86%] w-[88%] flex-col rounded-xl bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-950 p-2.5 shadow-xl ring-1 ring-black/50 sm:p-3.5">
        {/* Jendela label (cover) */}
        <div className="relative flex-1 overflow-hidden rounded-md bg-black/40 ring-2 ring-black/30">
          {src ? (
            <Cover src={src} alt={alt ?? ""} className="h-full w-full rounded-none" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand to-brand-strong">
              <Music className="h-8 w-8 text-white/90" aria-hidden />
            </div>
          )}
        </div>

        {/* Roda pita */}
        <div className="mt-2 flex items-center justify-between gap-4 px-1.5 sm:mt-2.5">
          <TapeReel />
          <TapeReel />
        </div>
      </div>

      {/* Ikon musik pojok kiri atas */}
      <span className="absolute left-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-brand/90 text-white shadow-sm backdrop-blur-sm">
        <Music className="h-3.5 w-3.5" aria-hidden />
      </span>
    </div>
  );
}

function TapeReel() {
  return (
    <div
      className="relative h-7 w-7 animate-spin-slow rounded-full bg-zinc-950 ring-2 ring-zinc-600 motion-reduce:animate-none sm:h-9 sm:w-9"
      style={{ animationDuration: "8s", animationTimingFunction: "linear" }}
      aria-hidden
    >
      <div className="absolute inset-[10%] rounded-full bg-zinc-700" />
      <div className="absolute inset-[30%] rounded-full bg-zinc-950 ring-1 ring-zinc-600" />
      <div className="absolute left-1/2 top-[4%] h-[92%] w-[16%] -translate-x-1/2 rounded-sm bg-zinc-600/80" />
      <div className="absolute left-[4%] top-1/2 h-[16%] w-[92%] -translate-y-1/2 rounded-sm bg-zinc-600/80" />
    </div>
  );
}
