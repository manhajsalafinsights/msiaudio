import { cn } from "@/utils/cn";

type ProgressBarProps = {
  /** 0–100 */
  value: number;
  className?: string;
  barClassName?: string;
};

export function ProgressBar({ value, className, barClassName }: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-1.5 overflow-hidden rounded-full bg-border/60", className)}
    >
      <div
        className={cn("h-full rounded-full bg-brand transition-all", barClassName)}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
