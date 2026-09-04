import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "dark";
  size?: "sm" | "md" | "lg";
  href?: string;
  loading?: boolean;
  children: React.ReactNode;
}

const variants = {
  primary:
    "bg-primary text-white shadow-sm hover:bg-primary-dark hover:shadow-md",
  dark: "bg-navy text-white shadow-sm hover:bg-navy/90 hover:shadow-md",
  secondary:
    "bg-white text-navy border border-border shadow-sm hover:bg-surface hover:border-slate-300",
  outline:
    "border border-primary/40 text-primary hover:bg-primary hover:text-white hover:border-primary",
  ghost: "text-navy hover:bg-surface",
};

const sizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-8 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  href,
  className,
  children,
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
    variants[variant],
    sizes[size],
    className,
  );

  if (href && !loading && !disabled) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}
