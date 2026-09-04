"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck, RefreshCw, Pencil } from "lucide-react";
import SiteLayout from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/components/cart/CartProvider";
import { useToast } from "@/components/ui/Toast";
import { formatPrice } from "@/lib/products/product-prices";
import { createClient } from "@/lib/supabase/client";
import { toCartRef } from "@/lib/studio/design";
import {
  readStudioResult, clearStudioResult, setStudioEditState, setStudioIntent,
} from "@/lib/studio/handoff";
import { useNavCatalog } from "@/components/layout/nav-context";
import { CATEGORY_BLURBS } from "@/lib/constants";

const HIDDEN_OPTS = new Set(["need_design_help"]);

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateItem, clearCart, subtotal } = useCart();
  const toast = useToast();
  const [checkingAuth, setCheckingAuth] = useState(false);
  const catalog = useNavCatalog();
  const popularCategories = catalog.filter((c) => c.products.length > 0).slice(0, 4);

  // Apply a design returned from the studio "Edit Artwork" flow.
  useEffect(() => {
    for (const item of items) {
      if (!item.design_full) continue;
      const result = readStudioResult(item.product_slug);
      if (result?.cartItemId === item.id && result.design) {
        updateItem(item.id, {
          design: toCartRef(result.design, result.thumbnailUrl),
          design_full: result.design,
          image_url: result.thumbnailUrl || item.image_url,
        });
        clearStudioResult(item.product_slug);
        toast.success("Artwork updated");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const editArtwork = (item: (typeof items)[number]) => {
    if (!item.design_full) return;
    setStudioEditState(item.product_slug, item.design_full);
    setStudioIntent({
      slug: item.product_slug,
      selectedOptions: item.selected_options,
      returnTo: "/cart",
      cartItemId: item.id,
    });
    router.push(`/studio/${item.product_slug}`);
  };

  const goToCheckout = async () => {
    setCheckingAuth(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    router.push(user ? "/checkout" : "/login?redirect=/checkout");
  };

  return (
    <SiteLayout>
      <div className="mp-container py-10 sm:py-14">
        <h1 className="text-3xl font-extrabold tracking-tight text-navy">Your cart</h1>
        <p className="mt-1 text-muted">Review your items and check out securely.</p>

        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-border bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShoppingBag size={28} aria-hidden="true" />
            </div>
            <p className="font-display mt-5 text-xl font-semibold text-navy">Your cart is empty</p>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">
              Business cards, signs, apparel, promo — everything ships with upfront pricing. Add a
              product to get started.
            </p>
            <Button href="/products" className="mt-6">
              Browse products
            </Button>

            {popularCategories.length > 0 && (
              <div className="mx-auto mt-10 grid max-w-xl gap-3 border-t border-border pt-8 sm:grid-cols-2">
                {popularCategories.map((c) => (
                  <Link
                    key={c.name}
                    href={c.href}
                    className="flex items-center gap-3 rounded-xl border border-border bg-surface/50 px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <span className="text-xl" aria-hidden="true">
                      {CATEGORY_BLURBS[c.name]?.icon ?? "🖨️"}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-navy">{c.name}</span>
                      <span className="block truncate text-xs text-muted">
                        {c.products.length} product{c.products.length === 1 ? "" : "s"}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]">
            <div>
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm">
                    <Link
                      href={`/products/${item.product_slug}`}
                      className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface"
                    >
                      {item.image_url && (
                        <Image
                          src={item.image_url}
                          alt=""
                          fill
                          className={item.design ? "object-contain p-1" : "object-cover"}
                          sizes="80px"
                          unoptimized={item.image_url.startsWith("data:")}
                        />
                      )}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                            {item.category}
                          </p>
                          <h3 className="truncate font-semibold text-navy">{item.product_title}</h3>
                        </div>
                        <button
                          onClick={() => {
                            removeItem(item.id);
                            toast.toast("Removed from cart");
                          }}
                          className="shrink-0 rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-danger"
                          aria-label={`Remove ${item.product_title}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {Object.entries(item.selected_options ?? {})
                          .filter(([k, v]) => v && !HIDDEN_OPTS.has(k))
                          .map(([k, v]) => (
                            <span key={k} className="rounded-md bg-surface px-2 py-0.5 text-xs text-navy">
                              <span className="capitalize text-muted">{k.replace(/_/g, " ")}:</span> {v}
                            </span>
                          ))}
                      </div>

                      {item.artwork_files && item.artwork_files.length > 0 && (
                        <p className="mt-2 text-xs text-muted">
                          {item.artwork_files.length} artwork file{item.artwork_files.length === 1 ? "" : "s"} attached
                        </p>
                      )}

                      {item.design && (
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-0.5 font-semibold text-green-700">
                            Artwork uploaded{item.design.sides === 2 ? " · front + back" : ""}
                          </span>
                          {item.design_full && (
                            <button
                              onClick={() => editArtwork(item)}
                              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                            >
                              <Pencil size={11} /> Edit artwork
                            </button>
                          )}
                        </div>
                      )}

                      <p className="mt-2 font-bold text-navy">
                        {formatPrice(item.line_total || item.unit_price)}
                        {!item.is_tier_pricing && item.quantity > 1 && (
                          <span className="ml-2 text-xs font-normal text-muted">
                            {formatPrice(item.unit_price)} × {item.quantity}
                          </span>
                        )}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center justify-between">
                <button onClick={clearCart} className="text-sm text-muted hover:text-danger">
                  Clear cart
                </button>
                <Link href="/products" className="text-sm font-semibold text-primary hover:underline">
                  Continue shopping
                </Link>
              </div>
            </div>

            {/* summary */}
            <aside className="h-max rounded-2xl border border-border bg-white p-6 shadow-md lg:sticky lg:top-24">
              <h2 className="font-bold text-navy">Order summary</h2>
              <div className="mt-4 flex items-center justify-between text-sm text-muted">
                <span>Subtotal ({items.length} item{items.length === 1 ? "" : "s"})</span>
                <span className="font-semibold text-navy">{formatPrice(subtotal)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm text-muted">
                <span>Shipping &amp; tax</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-base font-bold text-navy">
                <span>Total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <Button onClick={goToCheckout} loading={checkingAuth} size="lg" className="mt-5 w-full">
                Checkout <ArrowRight size={18} />
              </Button>

              <ul className="mt-5 space-y-2 text-xs text-muted">
                <li className="flex items-center gap-2"><ShieldCheck size={14} className="text-success" /> Secure Stripe checkout — price re-verified on our server</li>
                <li className="flex items-center gap-2"><Truck size={14} className="text-success" /> Nationwide shipping</li>
                <li className="flex items-center gap-2"><RefreshCw size={14} className="text-success" /> Free design review before we print</li>
              </ul>
            </aside>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
