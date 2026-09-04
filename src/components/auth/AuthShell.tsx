import Link from "next/link";
import { Logo, LogoCompact } from "@/components/layout/Logo";

const PANEL_POINTS = [
  "Upfront pricing on every product",
  "Design help & a free proof on every order",
  "Secure checkout, server-verified pricing",
];

/**
 * Shared split layout for /login, /signup and /admin/login — a compact form
 * on the right, a little brand storytelling on the left (hidden on small
 * screens so the form stays the focus on mobile).
 */
export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-navy p-10 text-white lg:flex">
        <Link href="/" aria-label="MetroPrint Marketing — home">
          <Logo tone="light" />
        </Link>
        <div className="max-w-sm">
          <p className="font-display text-2xl font-medium leading-snug text-white/90">
            &ldquo;One partner for everything we print, wear, and hand out.&rdquo;
          </p>
          <ul className="mt-8 space-y-3 text-sm text-white/70">
            {PANEL_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-white/40">&copy; {new Date().getFullYear()} MetroPrint Marketing</p>
      </div>

      <div className="flex flex-col items-center justify-center bg-surface px-4 py-12 sm:px-6">
        <Link href="/" aria-label="MetroPrint Marketing — home" className="mb-8 lg:hidden">
          <LogoCompact tone="dark" />
        </Link>
        <div className="w-full max-w-sm">
          <p className="flex items-center gap-2 text-sm font-semibold text-primary lg:hidden">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
            {eyebrow}
          </p>
          <h1 className="font-display mt-2 text-2xl font-semibold text-navy sm:text-3xl">{title}</h1>
          <p className="mt-1.5 text-sm text-muted">{subtitle}</p>

          <div className="mt-8">{children}</div>

          {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
