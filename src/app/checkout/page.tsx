"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SiteLayout from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/product-prices";
import { ArtworkFilesList } from "@/components/orders/OrderItemSpecs";
import { createClient } from "@/lib/supabase/client";
import { Loader2, CreditCard } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal } = useCart();
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (!u) {
        router.replace("/login?redirect=/checkout");
        return;
      }
      setUser({
        email: u.email!,
        name:
          u.user_metadata?.full_name ||
          u.user_metadata?.name ||
          u.email!.split("@")[0],
      });
      setLoading(false);
    });
  }, [router]);

  const handlePay = async () => {
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, notes }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Checkout failed");

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
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

  if (items.length === 0) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-navy">Cart is empty</h1>
          <Button href="/products" className="mt-6">
            Browse Products
          </Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-navy">Checkout</h1>
        <p className="mt-2 text-muted">
          Signed in as <strong>{user?.email}</strong>.{" "}
          <Link href="/account" className="text-primary hover:underline">
            Account
          </Link>
        </p>

        <div className="mt-8 space-y-6">
          <div className="rounded-xl border border-border bg-white p-6">
            <h2 className="mb-4 font-semibold text-navy">Order Summary</h2>
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="border-b border-border pb-3 last:border-0"
                >
                  <div className="flex justify-between gap-4">
                    <span className="text-sm">{item.product_title}</span>
                    <span className="text-sm font-medium">
                      {formatPrice(item.line_total || item.unit_price)}
                    </span>
                  </div>
                  {item.artwork_files && item.artwork_files.length > 0 && (
                    <div className="mt-2">
                      <ArtworkFilesList files={item.artwork_files} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-border pt-4 font-semibold">
              <span>Total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-6">
            <label className="mb-2 block text-sm font-medium">
              Order notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Special instructions, deadlines, etc."
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button
            onClick={handlePay}
            disabled={submitting}
            size="lg"
            className="w-full"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Redirecting to Stripe...
              </>
            ) : (
              <>
                <CreditCard size={18} /> Pay {formatPrice(subtotal)} with Stripe
              </>
            )}
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
}
