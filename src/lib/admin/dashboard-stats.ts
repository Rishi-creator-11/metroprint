import { createServiceClient } from "@/lib/supabase/server";
import { normalizeOrder } from "@/lib/checkout/quote-normalize";
import { isInquiry, isPaidOrder } from "@/lib/checkout/order-utils";
import type { Order } from "@/lib/types";

export interface AdminDashboardStats {
  productsActive: number;
  productsInactive: number;
  categories: number;
  ordersTotal: number;
  ordersPending: number;
  ordersProcessing: number;
  inquiriesOpen: number;
  revenuePaid: number;
  recentOrders: Order[];
  recentInquiries: Order[];
}

export async function loadAdminDashboardStats(): Promise<AdminDashboardStats> {
  const supabase = await createServiceClient();

  const [
    { count: activeCount },
    { count: inactiveCount },
    { count: categoryCount },
    { data: requestRows },
  ] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("active", false),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase
      .from("quote_requests")
      .select("*")
      .or("payment_status.eq.paid,category.eq.Inquiry")
      .order("created_at", { ascending: false }),
  ]);

  const all = (requestRows ?? []).map((r) => normalizeOrder(r));
  const orders = all.filter((r) => isPaidOrder(r));
  const inquiries = all.filter((r) => isInquiry(r));

  return {
    productsActive: activeCount ?? 0,
    productsInactive: inactiveCount ?? 0,
    categories: categoryCount ?? 0,
    ordersTotal: orders.length,
    ordersPending: orders.filter((o) => o.status === "pending").length,
    ordersProcessing: orders.filter((o) => o.status === "processing").length,
    inquiriesOpen: inquiries.filter((i) => i.status === "pending").length,
    revenuePaid: orders.reduce((s, o) => s + (o.total_amount ?? 0), 0),
    recentOrders: orders.slice(0, 6),
    recentInquiries: inquiries.slice(0, 5),
  };
}
