"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingCart, User, ChevronDown } from "lucide-react";
import { NAV_LINKS, CATEGORY_BLURBS } from "@/lib/constants";
import { LogoCompact } from "./Logo";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/cart/CartProvider";
import { useNavCatalog } from "@/components/layout/nav-context";
import { createClient } from "@/lib/supabase/client";

export function Header() {
  const catalog = useNavCatalog();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCat, setMobileCat] = useState<string | null>(null);
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const { count } = useCart();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUserEmail(user?.email ?? null));
  }, [pathname]);

  useEffect(() => {
    setMobileOpen(false);
    setOpenCat(null);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Escape closes whichever menu is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (mobileOpen) setMobileOpen(false);
      if (openCat) setOpenCat(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, openCat]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const open = (name: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenCat(name);
  };
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpenCat(null), 140);
  };

  const catActive = (href: string) =>
    href.startsWith("/business-cards") && pathname.startsWith("/business-cards");

  return (
    <header
      className={cn(
        "sticky top-0 z-50 text-white transition-shadow",
        scrolled ? "bg-navy/95 shadow-lg backdrop-blur" : "bg-navy",
      )}
    >
      {/* Row 1 — brand + utilities */}
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center gap-3 px-4 transition-[padding] duration-200 sm:px-6 lg:px-8",
          scrolled ? "py-2" : "py-3",
        )}
      >
        <Link href="/" className="shrink-0" aria-label="MetroPrint Marketing — home">
          <LogoCompact />
        </Link>

        <div className="ml-auto flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "hidden whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10 sm:block",
                pathname === link.href && "text-accent",
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={userEmail ? "/account" : "/login"}
            className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium hover:bg-white/10 sm:flex"
          >
            <User size={16} />
            {userEmail ? "Account" : "Sign in"}
          </Link>
          <Link href="/cart" className="relative rounded-lg p-2.5 hover:bg-white/10" aria-label={`Cart, ${count} items`}>
            <ShoppingCart size={20} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-navy">
                {count}
              </span>
            )}
          </Link>
          <button
            type="button"
            className="rounded-lg p-2.5 hover:bg-white/10 lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Row 2 — every category with its own product dropdown (desktop) */}
      <div className="hidden border-t border-white/10 lg:block">
        <nav className="mx-auto flex max-w-7xl items-center gap-1 px-4 sm:px-6 lg:px-8">
          {catalog.map((c, i) => {
            const meta = CATEGORY_BLURBS[c.name];
            const isOpen = openCat === c.name;
            const n = c.products.length;
            const cols = n <= 8 ? 1 : n <= 16 ? 2 : 3;
            const rows = Math.max(1, Math.ceil(n / cols));
            const alignRight = i >= Math.ceil(catalog.length / 2);
            return (
              <div
                key={c.name}
                className="relative"
                onMouseEnter={() => open(c.name)}
                onMouseLeave={scheduleClose}
              >
                <Link
                  href={c.href}
                  onClick={() => setOpenCat(null)}
                  aria-expanded={isOpen}
                  className={cn(
                    "flex items-center gap-0.5 whitespace-nowrap border-b-2 border-transparent px-2.5 py-3 text-[13px] font-medium transition-colors hover:text-accent xl:text-sm",
                    (isOpen || catActive(c.href)) && "border-accent text-accent",
                  )}
                >
                  {c.name}
                  {n > 0 && (
                    <ChevronDown size={13} className={cn("transition-transform", isOpen && "rotate-180")} />
                  )}
                </Link>

                {isOpen && n > 0 && (
                  <div
                    className={cn(
                      "absolute top-full z-50 pt-0",
                      alignRight ? "right-0" : "left-0",
                    )}
                    onMouseEnter={() => open(c.name)}
                    onMouseLeave={scheduleClose}
                  >
                    <div>
                      <div className="animate-scale-in origin-top overflow-hidden rounded-b-2xl border border-t-0 border-border bg-white text-navy shadow-2xl">
                        <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
                          <span className="text-base leading-none">{meta?.icon ?? "🖨️"}</span>
                          <span className="text-sm font-bold">{c.name}</span>
                          <Link
                            href={c.href}
                            onClick={() => setOpenCat(null)}
                            className="ml-6 text-xs font-semibold text-primary hover:underline"
                          >
                            View all →
                          </Link>
                        </div>
                        <div
                          className="grid grid-flow-col gap-x-6 gap-y-0.5 p-3"
                          style={{ gridTemplateRows: `repeat(${rows}, auto)` }}
                        >
                          {c.products.map((p) => (
                            <Link
                              key={p.slug}
                              href={p.href}
                              onClick={() => setOpenCat(null)}
                              className="block w-60 truncate rounded-md px-2 py-1.5 text-[13px] text-muted transition-colors hover:bg-surface hover:text-primary focus-visible:bg-surface focus-visible:text-primary"
                              title={p.title}
                            >
                              {p.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <Link
            href="/products"
            className="ml-auto whitespace-nowrap px-2.5 py-3 text-[13px] font-semibold text-white/70 transition-colors hover:text-accent xl:text-sm"
          >
            All products →
          </Link>
        </nav>
      </div>

      {/* Mobile / tablet menu */}
      {mobileOpen && (
        <nav className="animate-fade-in max-h-[80vh] overflow-y-auto border-t border-white/10 px-4 pb-5 pt-3 lg:hidden">
          <p className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wide text-white/40">Products</p>
          {catalog.map((c) => {
            const isOpen = mobileCat === c.name;
            return (
              <div key={c.name}>
                <div className="flex items-center">
                  <Link
                    href={c.href}
                    className="flex-1 rounded-lg px-3 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10"
                  >
                    {c.name}
                  </Link>
                  {c.products.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setMobileCat(isOpen ? null : c.name)}
                      className="rounded-lg p-2.5 text-white/70 hover:bg-white/10"
                      aria-label={`${isOpen ? "Hide" : "Show"} ${c.name} products`}
                      aria-expanded={isOpen}
                    >
                      <ChevronDown size={16} className={cn("transition-transform", isOpen && "rotate-180")} />
                    </button>
                  )}
                </div>
                {isOpen && (
                  <ul className="mb-1 ml-3 space-y-0.5 border-l border-white/10 pl-3">
                    {c.products.map((p) => (
                      <li key={p.slug}>
                        <Link
                          href={p.href}
                          className="block rounded-lg px-3 py-1.5 text-[13px] text-white/70 hover:bg-white/10 hover:text-white"
                        >
                          {p.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
          <Link href="/products" className="mt-1 block rounded-lg px-3 py-2.5 text-sm font-medium text-accent hover:bg-white/10">
            All products →
          </Link>

          <div className="my-2 border-t border-white/10" />
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-white/10">
              {link.label}
            </Link>
          ))}
          <Link
            href={userEmail ? "/account" : "/login"}
            className="block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-white/10"
          >
            {userEmail ? "Account" : "Sign in"}
          </Link>
        </nav>
      )}
    </header>
  );
}
