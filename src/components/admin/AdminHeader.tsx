"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LogOut,
  LayoutDashboard,
  Package,
  Layers,
  DollarSign,
  ShoppingCart,
  MessageSquare,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LogoCompact } from "@/components/layout/Logo";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Layers },
  { href: "/admin/prices", label: "Pricing", icon: DollarSign },
  { href: "/admin/dashboard?type=orders", label: "Orders", icon: ShoppingCart, match: "/admin/dashboard" },
  { href: "/admin/dashboard?type=inquiries", label: "Inquiries", icon: MessageSquare, match: "/admin/dashboard" },
];

export function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    await createClient().auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const isActive = (l: (typeof LINKS)[number]) =>
    l.exact ? pathname === l.href : pathname.startsWith(l.match ?? l.href.split("?")[0]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/admin" className="shrink-0 rounded-lg bg-navy px-2.5 py-1.5">
          <LogoCompact />
        </Link>

        <nav className="ml-2 hidden items-center gap-0.5 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(l) ? "bg-primary/10 text-primary" : "text-muted hover:bg-surface hover:text-navy",
              )}
            >
              <l.icon size={15} />
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Link
            href="/"
            target="_blank"
            className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-surface hover:text-navy sm:flex"
          >
            <ExternalLink size={14} /> Storefront
          </Link>
          <button
            onClick={logout}
            className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted hover:text-danger sm:flex"
          >
            <LogOut size={15} /> Logout
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg p-2 text-muted hover:bg-surface lg:hidden"
            aria-label="Toggle admin menu"
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="animate-fade-in border-t border-border px-4 pb-4 pt-2 lg:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
                isActive(l) ? "bg-primary/10 text-primary" : "text-navy hover:bg-surface",
              )}
            >
              <l.icon size={16} />
              {l.label}
            </Link>
          ))}
          <button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-danger">
            <LogOut size={16} /> Logout
          </button>
        </nav>
      )}
    </header>
  );
}
