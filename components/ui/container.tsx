import { cn } from "@/utils/cn";

type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  /** `default` = konten reguler, `wide` = konten lebih lebar (player, dsb). */
  size?: "default" | "wide";
};

export function Container({ className, size = "default", ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        size === "default" ? "max-w-6xl" : "max-w-7xl",
        className,
      )}
      {...props}
    />
  );
}
