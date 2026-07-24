"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SiteLayout from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/Button";
import { PaymentBadge } from "@/components/ui/WorkflowBadge";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/product-prices";
import { Loader2 } from "lucide-react";
import type { Order } from "@/lib/types";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user: u } }) => {
      if (!u) {
        router.replace("/login?redirect=/account");
        return;
      }
      setUser({
        email: u.email!,
        name: u.user_metadata?.full_name || u.email!.split("@")[0],
      });

      const { data } = await supabase
        .from("quote_requests")
        .select("*")
        .eq("email", u.email)
        .eq("payment_status", "paid")
        .order("created_at", { ascending: false });

      setOrders((data as Order[]) || []);
      setLoading(false);
    });
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <SiteLayout>
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-navy">My Account</h1>
            <p className="mt-1 text-muted">{user?.name} · {user?.email}</p>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            Sign Out
          </Button>
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-semibold text-navy">Order History</h2>
          {orders.length === 0 ? (
            <p className="mt-4 text-muted">No orders yet.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {orders.map((order) => (
                <li
                  key={order.id}
                  className="rounded-xl border border-border bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-xs text-muted">
                        {order.order_number}
                      </p>
                      <p className="font-medium text-navy">{order.product_name}</p>
                      <p className="text-xs text-muted">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {order.total_amount != null && (
                        <p className="font-semibold">{formatPrice(order.total_amount)}</p>
                      )}
                      <PaymentBadge status={order.payment_status} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
