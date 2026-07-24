"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogoCompact } from "@/components/layout/Logo";
import { LogOut } from "lucide-react";
import Link from "next/link";

export function AdminHeader() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/admin/dashboard">
          <div className="rounded-lg bg-navy px-3 py-2">
            <LogoCompact />
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/prices"
            className="text-sm text-muted hover:text-primary"
          >
            Prices
          </Link>
          <Link
            href="/admin/dashboard"
            className="text-sm text-muted hover:text-primary"
          >
            Orders
          </Link>
          <Link
            href="/"
            className="text-sm text-muted hover:text-primary"
            target="_blank"
          >
            View Site
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-red-600"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </header>
  );
}
