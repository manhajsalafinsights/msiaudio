import { cn } from "@/utils/cn";

type HeadingAs = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> & {
  as?: HeadingAs;
};

const headingStyles: Record<HeadingAs, string> = {
  h1: "text-3xl font-bold tracking-tight md:text-4xl",
  h2: "text-2xl font-semibold tracking-tight md:text-3xl",
  h3: "text-xl font-semibold tracking-tight",
  h4: "text-lg font-semibold",
  h5: "text-base font-semibold",
  h6: "text-sm font-semibold uppercase tracking-wider",
};

export function Heading({ as: Tag = "h2", className, ...props }: HeadingProps) {
  return <Tag className={cn(headingStyles[Tag], className)} {...props} />;
}

type TextVariant = "default" | "muted" | "small" | "lead" | "error" | "success";

type TextProps = React.HTMLAttributes<HTMLParagraphElement> & {
  variant?: TextVariant;
  as?: "p" | "span" | "div";
};

const textStyles: Record<TextVariant, string> = {
  default: "text-base text-foreground",
  muted: "text-sm text-muted",
  small: "text-xs text-muted",
  lead: "text-lg text-foreground",
  error: "text-sm text-danger",
  success: "text-sm text-success",
};

export function Text({ variant = "default", as: Tag = "p", className, ...props }: TextProps) {
  return <Tag className={cn(textStyles[variant], className)} {...props} />;
}
