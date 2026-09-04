import { cn } from "@/lib/utils";

type Tone = "primary" | "accent" | "success" | "warning" | "danger" | "neutral" | "featured";

const tones: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary ring-primary/20",
  accent: "bg-accent/10 text-accent ring-accent/20",
  success: "bg-green-50 text-green-700 ring-green-600/20",
  warning: "bg-amber-50 text-amber-700 ring-amber-600/20",
  danger: "bg-red-50 text-red-700 ring-red-600/20",
  neutral: "bg-slate-100 text-slate-600 ring-slate-500/15",
  featured: "bg-amber-400/15 text-amber-700 ring-amber-500/30",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
