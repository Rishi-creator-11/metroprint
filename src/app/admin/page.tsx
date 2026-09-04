import Link from "next/link";
import {
  Package,
  Layers,
  ShoppingCart,
  MessageSquare,
  DollarSign,
  ArrowRight,
  Plus,
  Image as ImageIcon,
  Tag,
  Clock,
} from "lucide-react";
import { requireAdminUser } from "@/lib/admin/admin-server";
import { loadAdminDashboardStats } from "@/lib/admin/dashboard-stats";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatPrice } from "@/lib/products/product-prices";

export const metadata = { title: "Dashboard · Admin" };

export default async function AdminOverviewPage() {
  await requireAdminUser();
  const s = await loadAdminDashboardStats();

  const stats = [
    { label: "Active products", value: s.productsActive, sub: `${s.productsInactive} inactive`, icon: Package, href: "/admin/products?featured=" },
    { label: "Categories", value: s.categories, sub: "visible + hidden", icon: Layers, href: "/admin/categories" },
    { label: "Paid orders", value: s.ordersTotal, sub: `${s.ordersPending} pending · ${s.ordersProcessing} processing`, icon: ShoppingCart, href: "/admin/dashboard?type=orders" },
    { label: "Open inquiries", value: s.inquiriesOpen, sub: "awaiting reply", icon: MessageSquare, href: "/admin/dashboard?type=inquiries" },
    { label: "Revenue (paid)", value: formatPrice(s.revenuePaid), sub: "lifetime", icon: DollarSign, href: "/admin/dashboard?type=orders" },
  ];

  const actions = [
    { label: "Add product", href: "/admin/products", icon: Plus },
    { label: "Upload product image", href: "/admin/products", icon: ImageIcon },
    { label: "Edit pricing", href: "/admin/prices", icon: DollarSign },
    { label: "Add category", href: "/admin/categories", icon: Tag },
    { label: "View orders", href: "/admin/dashboard?type=orders", icon: ShoppingCart },
    { label: "View inquiries", href: "/admin/dashboard?type=inquiries", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <AdminHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-navy">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Everything for day-to-day operations, connected live to Supabase.</p>

        {/* stat cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {stats.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="group rounded-2xl border border-border bg-white p-5 transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">{c.label}</span>
                <c.icon size={16} className="text-primary/50" />
              </div>
              <p className="mt-2 text-2xl font-extrabold text-navy">{c.value}</p>
              <p className="mt-1 text-xs text-muted">{c.sub}</p>
            </Link>
          ))}
        </div>

        {/* quick actions */}
        <div className="mt-8">
          <h2 className="text-sm font-bold text-navy">Quick actions</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {actions.map((a) => (
              <Link
                key={a.label}
                href={a.href}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3.5 py-2 text-sm font-medium text-navy transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                <a.icon size={15} className="text-primary" />
                {a.label}
              </Link>
            ))}
          </div>
        </div>

        {/* recent */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <RecentPanel title="Recent orders" href="/admin/dashboard?type=orders" empty="No paid orders yet.">
            {s.recentOrders.map((r) => (
              <RecentRow key={r.id} id={r.id} name={r.customer_name} sub={r.product_name} createdAt={r.created_at}>
                {r.total_amount != null ? (
                  <span className="text-sm font-semibold text-navy">{formatPrice(r.total_amount)}</span>
                ) : (
                  <StatusBadge status={r.status} />
                )}
              </RecentRow>
            ))}
          </RecentPanel>

          <RecentPanel title="Recent inquiries" href="/admin/dashboard?type=inquiries" empty="No inquiries yet.">
            {s.recentInquiries.map((r) => (
              <RecentRow key={r.id} id={r.id} name={r.customer_name} sub={r.email} createdAt={r.created_at}>
                <StatusBadge status={r.status} />
              </RecentRow>
            ))}
          </RecentPanel>
        </div>
      </main>
    </div>
  );
}

function RecentPanel({
  title,
  href,
  empty,
  children,
}: {
  title: string;
  href: string;
  empty: string;
  children: React.ReactNode[];
}) {
  return (
    <div className="rounded-2xl border border-border bg-white">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <h2 className="text-sm font-bold text-navy">{title}</h2>
        <Link href={href} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
          View all <ArrowRight size={13} />
        </Link>
      </div>
      {children.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-muted">{empty}</p>
      ) : (
        <ul className="divide-y divide-border">{children}</ul>
      )}
    </div>
  );
}

function RecentRow({
  id,
  name,
  sub,
  createdAt,
  children,
}: {
  id: string;
  name: string;
  sub: string;
  createdAt: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link href={`/admin/dashboard/${id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-surface/60">
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-navy">{name}</span>
          <span className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted">
            <Clock size={11} /> {new Date(createdAt).toLocaleDateString()} · {sub}
          </span>
        </span>
        <span className="shrink-0">{children}</span>
      </Link>
    </li>
  );
}

export const dynamic = "force-dynamic";
