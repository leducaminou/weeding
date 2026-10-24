import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "gold" | "ghost";
type Size = "md" | "lg";

const base =
  "relative inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none overflow-hidden group";

const variants: Record<Variant, string> = {
  gold: cn(
    "bg-gradient-to-br from-gold-300 via-gold-400 to-gold-500 text-royal-900",
    "shadow-[0_2px_12px_rgba(201,160,67,0.3)]",
    "hover:shadow-[0_4px_18px_rgba(201,160,67,0.45)]",
    "hover:-translate-y-0.5"
  ),
  primary: cn(
    "bg-royal-600 text-ivory-50",
    "shadow-[0_2px_12px_rgba(29,64,121,0.2)]",
    "hover:bg-royal-700 hover:shadow-[0_4px_18px_rgba(29,64,121,0.3)]",
    "hover:-translate-y-0.5"
  ),
  ghost: cn(
    "border border-gold-500/50 text-royal-800 bg-ivory-50/50 backdrop-blur",
    "hover:bg-gold-50 hover:border-gold-500"
  ),
};

const sizes: Record<Size, string> = {
  md: "h-11 px-7 text-sm rounded-full",
  lg: "h-14 px-10 text-base rounded-full",
};

interface ButtonProps extends ComponentProps<"button"> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = "gold",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <span className="relative">{children}</span>
    </button>
  );
}

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: Variant;
  size?: Size;
}

export function ButtonLink({
  variant = "gold",
  size = "md",
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <span className="relative">{children}</span>
    </Link>
  );
}