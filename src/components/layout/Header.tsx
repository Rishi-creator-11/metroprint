"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingCart, User } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { LogoCompact } from "./Logo";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/cart/CartProvider";
import { createClient } from "@/lib/supabase/client";

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count } = useCart();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null);
    });
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 bg-navy text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0">
          <LogoCompact />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-accent",
                pathname === link.href && "text-accent underline underline-offset-4"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/cart" className="relative rounded-lg p-2 hover:bg-white/10" aria-label="Cart">
            <ShoppingCart size={20} />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-navy">
                {count}
              </span>
            )}
          </Link>
          <Link
            href={userEmail ? "/account" : "/login"}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm hover:bg-white/10"
          >
            <User size={18} />
            {userEmail ? "Account" : "Sign In"}
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <Link href="/cart" className="relative rounded-lg p-2 hover:bg-white/10" aria-label="Shopping cart">
            <ShoppingCart size={20} />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-navy">
                {count}
              </span>
            )}
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 hover:bg-white/10"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-white/10 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium hover:bg-white/10",
                  pathname === link.href && "bg-white/10 text-accent"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={userEmail ? "/account" : "/login"}
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-white/10"
            >
              {userEmail ? "Account" : "Sign In"}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
