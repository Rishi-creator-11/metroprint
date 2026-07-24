import { createServiceClient } from "@/lib/supabase/server";
import { requireAdminUser } from "@/lib/admin-server";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PaymentBadge } from "@/components/ui/WorkflowBadge";
import { TypeBadge } from "@/components/ui/TypeBadge";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { normalizeOrder } from "@/lib/quote-normalize";
import { isInquiry, isPaidOrder } from "@/lib/order-utils";
import { formatPrice } from "@/lib/product-prices";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { OrderStatus } from "@/lib/types";

export const metadata = {
  title: "Admin Dashboard — MetroPrint USA",
};

const STATUSES: (OrderStatus | "all")[] = [
  "all",
  "pending",
  "processing",
  "completed",
  "cancelled",
];

const TYPE_FILTERS = [
  { key: "all", label: "All" },
  { key: "orders", label: "Orders" },
  { key: "inquiries", label: "Inquiries" },
] as const;

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>;
}) {
  const { status: filterStatus, type: filterType } = await searchParams;
  await requireAdminUser();
  const supabase = await createServiceClient();

  const { data: allRequests } = await supabase
    .from("quote_requests")
    .select("*")
    .or("payment_status.eq.paid,category.eq.Inquiry")
    .order("created_at", { ascending: false });

  const all = (allRequests || []).map((r) => normalizeOrder(r));

  const byType =
    filterType === "orders"
      ? all.filter((r) => isPaidOrder(r))
      : filterType === "inquiries"
        ? all.filter((r) => isInquiry(r))
        : all;

  const showStatusFilters = filterType === "orders" || filterType === "inquiries";

  const items =
    showStatusFilters && filterStatus && filterStatus !== "all"
      ? byType.filter((r) => r.status === filterStatus)
      : byType;

  const counts = {
    all: byType.length,
    pending: byType.filter((r) => r.status === "pending").length,
    processing: byType.filter((r) => r.status === "processing").length,
    completed: byType.filter((r) => r.status === "completed").length,
    cancelled: byType.filter((r) => r.status === "cancelled").length,
  };

  const typeQuery = (type: string) => {
    const params = new URLSearchParams();
    if (type !== "all") params.set("type", type);
    if (type !== "all" && filterStatus && filterStatus !== "all") {
      params.set("status", filterStatus);
    }
    const q = params.toString();
    return q ? `/admin/dashboard?${q}` : "/admin/dashboard";
  };

  const statusQuery = (status: string) => {
    const params = new URLSearchParams();
    if (filterType && filterType !== "all") params.set("type", filterType);
    if (status !== "all") params.set("status", status);
    const q = params.toString();
    return q ? `/admin/dashboard?${q}` : "/admin/dashboard";
  };

  return (
    <div className="min-h-screen bg-surface">
      <AdminHeader />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-navy">Orders & Inquiries</h1>
        <p className="mt-1 text-sm text-muted">
          Paid orders from checkout and custom quote requests from the homepage
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {TYPE_FILTERS.map(({ key, label }) => (
            <Link
              key={key}
              href={typeQuery(key)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                (filterType || "all") === key
                  ? "bg-navy text-white"
                  : "bg-white text-muted hover:bg-slate-100"
              )}
            >
              {label}
            </Link>
          ))}
        </div>

        {showStatusFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            {STATUSES.map((status) => (
              <Link
                key={status}
                href={statusQuery(status)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors",
                  (filterStatus || "all") === status
                    ? "bg-primary text-white"
                    : "bg-white text-muted hover:bg-slate-100"
                )}
              >
                {status}{" "}
                <span className="ml-1 opacity-70">
                  ({counts[status as keyof typeof counts] || 0})
                </span>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 overflow-hidden rounded-xl border border-border bg-white shadow-sm">
          {items.length === 0 ? (
            <p className="p-8 text-center text-muted">Nothing found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-surface">
                  <tr>
                    <th className="px-4 py-3 font-medium text-navy">Type</th>
                    <th className="px-4 py-3 font-medium text-navy">Ref #</th>
                    <th className="px-4 py-3 font-medium text-navy">Date</th>
                    <th className="px-4 py-3 font-medium text-navy">Customer</th>
                    <th className="px-4 py-3 font-medium text-navy">Summary</th>
                    <th className="px-4 py-3 font-medium text-navy">Payment</th>
                    <th className="px-4 py-3 font-medium text-navy">Status</th>
                    <th className="px-4 py-3 font-medium text-navy"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((req) => {
                    const inquiry = isInquiry(req);
                    return (
                      <tr key={req.id} className="hover:bg-surface/50">
                        <td className="px-4 py-3">
                          <TypeBadge type={inquiry ? "inquiry" : "order"} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">
                          {req.order_number || "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-muted">
                          {new Date(req.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{req.customer_name}</div>
                          <div className="text-xs text-muted">{req.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{req.product_name}</div>
                          {!inquiry && req.total_amount != null && (
                            <div className="text-xs text-muted">
                              {formatPrice(req.total_amount)}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {inquiry ? (
                            <span className="text-xs text-muted">Quote request</span>
                          ) : (
                            <PaymentBadge status={req.payment_status} />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={req.status} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/admin/dashboard/${req.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
