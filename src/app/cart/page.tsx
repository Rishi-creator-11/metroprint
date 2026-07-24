"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Trash2, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import SiteLayout from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/product-prices";
import { createClient } from "@/lib/supabase/client";

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, clearCart, subtotal } = useCart();
  const [checkingAuth, setCheckingAuth] = useState(false);

  const goToCheckout = async () => {
    setCheckingAuth(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login?redirect=/checkout");
      return;
    }
    router.push("/checkout");
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-navy">Your Cart</h1>
        <p className="mt-2 text-muted">Review items and proceed to secure checkout.</p>

        {items.length === 0 ? (
          <div className="mt-12 rounded-xl border border-border bg-surface p-12 text-center">
            <ShoppingBag className="mx-auto mb-4 text-muted" size={48} />
            <p className="text-muted">Your cart is empty.</p>
            <Button href="/products" className="mt-6">
              Browse Products
            </Button>
          </div>
        ) : (
          <>
            <ul className="mt-8 space-y-4">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl border border-border bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-primary">
                        {item.category}
                      </p>
                      <h3 className="font-semibold text-navy">{item.product_title}</h3>
                      <dl className="mt-3 space-y-1 text-sm">
                        {Object.entries(item.selected_options).map(([k, v]) => (
                          <div key={k} className="flex gap-2">
                            <dt className="capitalize text-muted">
                              {k.replace(/_/g, " ")}:
                            </dt>
                            <dd>{v}</dd>
                          </div>
                        ))}
                      </dl>
                      {item.artwork_files && item.artwork_files.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-muted">Artwork</p>
                          <ul className="mt-1 space-y-1">
                            {item.artwork_files.map((file) => (
                              <li key={file.url}>
                                <a
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary hover:underline"
                                >
                                  {file.name}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <p className="mt-3 font-semibold text-navy">
                        {formatPrice(item.line_total || item.unit_price)}
                        {item.quantity > 1 && (
                          <span className="ml-2 text-sm font-normal text-muted">
                            ({formatPrice(item.unit_price)} × {item.quantity})
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600"
                      aria-label="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center justify-between text-lg font-semibold text-navy">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-muted">
                Secure payment via Stripe. Sales tax may apply where required.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <button
                onClick={clearCart}
                className="text-sm text-muted hover:text-red-600"
              >
                Clear cart
              </button>
              <div className="flex flex-wrap gap-3">
                <Button href="/products" variant="outline">
                  Continue Shopping
                </Button>
                <Button onClick={goToCheckout} disabled={checkingAuth}>
                  {checkingAuth ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <>
                      Checkout <ArrowRight size={16} />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </SiteLayout>
  );
}
