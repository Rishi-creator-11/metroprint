"use client";

import { useMemo, useState } from "react";
import { Search, Check, Loader2, ChevronRight } from "lucide-react";
import { formatPrice, formatPriceLabel } from "@/lib/product-prices";
import {
  buildPricingDraft,
  pricingRulesFromDraft,
  previewTotalFromDraft,
} from "@/lib/pricing";
import { pricedOptionFields } from "@/lib/business-card-pricing-defaults";
import type { OptionsSchema, ProductCategory, ProductPricingRules } from "@/lib/types";

export interface AdminPricingProduct {
  id: string;
  title: string;
  slug: string;
  category: ProductCategory;
  subcategory?: string | null;
  price: number;
  active: boolean;
  options_schema: OptionsSchema;
  pricing_rules: ProductPricingRules | null;
}

type DraftState = Record<string, Record<string, string>>;

function initDraft(product: AdminPricingProduct): DraftState {
  const prices = buildPricingDraft(product);
  const draft: DraftState = {};
  for (const [field, values] of Object.entries(prices)) {
    draft[field] = {};
    for (const [opt, val] of Object.entries(values)) {
      draft[field][opt] = String(val);
    }
  }
  return draft;
}

function draftToNumbers(draft: DraftState): Record<string, Record<string, number>> {
  const out: Record<string, Record<string, number>> = {};
  for (const [field, values] of Object.entries(draft)) {
    out[field] = {};
    for (const [opt, val] of Object.entries(values)) {
      out[field][opt] = Number(val) || 0;
    }
  }
  return out;
}

export function AdminPricingHub({
  products,
}: {
  products: AdminPricingProduct[];
}) {
  const [selectedId, setSelectedId] = useState(products[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>("all");
  const [drafts, setDrafts] = useState<Record<string, DraftState>>(() => {
    const initial: Record<string, DraftState> = {};
    for (const p of products) initial[p.id] = initDraft(p);
    return initial;
  });
  const [savedIds, setSavedIds] = useState<Set<string>>(
    () =>
      new Set(
        products
          .filter((p) => p.pricing_rules?.option_prices)
          .map((p) => p.id)
      )
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  const subcategories = useMemo(
    () =>
      [...new Set(products.map((p) => p.subcategory).filter(Boolean))] as string[],
    [products]
  );

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (subcategoryFilter !== "all" && p.subcategory !== subcategoryFilter) {
        return false;
      }
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
      );
    });
  }, [products, subcategoryFilter, search]);

  const selected = products.find((p) => p.id === selectedId) ?? filtered[0];
  const draft = selected ? drafts[selected.id] : null;

  const pricedFields = selected
    ? pricedOptionFields(selected.options_schema)
    : [];

  const previewStart = useMemo(() => {
    if (!draft) return 0;
    return previewTotalFromDraft(draftToNumbers(draft));
  }, [draft]);

  const setOptionPrice = (
    productId: string,
    fieldName: string,
    optionValue: string,
    value: string
  ) => {
    setDrafts((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [fieldName]: {
          ...(prev[productId][fieldName] ?? {}),
          [optionValue]: value,
        },
      },
    }));
  };

  const handleSave = async () => {
    if (!selected || !draft) return;

    const pricing_rules = pricingRulesFromDraft(draft);
    const qtyPrices = pricing_rules.option_prices?.quantity;
    const fallbackPrice = qtyPrices
      ? Math.min(...Object.values(qtyPrices))
      : selected.price;

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/products/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: fallbackPrice,
          pricing_rules,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save");

      setSavedIds((prev) => new Set(prev).add(selected.id));
      setMessage({ type: "ok", text: `Saved all option prices for ${selected.title}` });
    } catch (err) {
      setMessage({
        type: "err",
        text: err instanceof Error ? err.message : "Save failed",
      });
    } finally {
      setSaving(false);
    }
  };

  if (products.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-white p-8 text-center text-muted">
        No business card products found. Run migrations 016–017 in Supabase.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="border-b border-border bg-navy px-6 py-6 text-white sm:px-8">
        <h2 className="text-xl font-bold">Set a price for every option</h2>
        <p className="mt-1 max-w-2xl text-sm text-white/75">
          Each row is one choice your customer can pick.{" "}
          <strong className="text-white">Quantity</strong> = total order price.{" "}
          Everything else (corners, foil, size, edges…) = added on top when selected.
        </p>
      </div>

      <div className="flex min-h-[600px] flex-col lg:flex-row">
        <aside className="w-full border-b border-border bg-surface/40 lg:w-72 lg:border-b-0 lg:border-r">
          <div className="p-4">
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="search"
                placeholder="Search cards…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-white py-2 pl-9 pr-3 text-sm"
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {["all", ...subcategories].map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSubcategoryFilter(sub)}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    subcategoryFilter === sub
                      ? "bg-navy text-white"
                      : "bg-white text-muted"
                  }`}
                >
                  {sub === "all" ? "All" : sub}
                </button>
              ))}
            </div>
          </div>
          <ul className="max-h-80 overflow-y-auto px-2 pb-4 lg:max-h-none">
            {filtered.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(p.id)}
                  className={`mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm ${
                    p.id === selected?.id
                      ? "bg-white shadow-sm ring-1 ring-primary/30"
                      : "hover:bg-white/70"
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate font-medium text-navy">
                    {p.title}
                  </span>
                  {savedIds.has(p.id) && (
                    <span className="shrink-0 text-[10px] font-bold uppercase text-green-600">
                      ✓
                    </span>
                  )}
                  <ChevronRight size={14} className="shrink-0 text-muted" />
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="flex-1 p-6 sm:p-8">
          {selected && draft ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-primary">
                    {selected.subcategory ?? "Business Cards"}
                  </p>
                  <h3 className="text-lg font-bold text-navy">{selected.title}</h3>
                </div>
                <p className="text-sm text-muted">
                  From{" "}
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(previewStart)}
                  </span>
                </p>
              </div>

              {message && (
                <p
                  className={`mt-4 rounded-lg px-4 py-2 text-sm ${
                    message.type === "ok"
                      ? "bg-green-50 text-green-800"
                      : "bg-red-50 text-red-800"
                  }`}
                >
                  {message.text}
                </p>
              )}

              <div className="mt-6 space-y-8">
                {pricedFields.map((field) => (
                  <section key={field.name}>
                    <h4 className="font-semibold text-navy">{field.label}</h4>
                    <p className="mb-3 text-xs text-muted">
                      {field.name === "quantity"
                        ? "Total price when the customer selects this quantity."
                        : "Amount added to the total when the customer selects this."}
                    </p>
                    <div className="divide-y divide-border rounded-xl border border-border bg-surface/30">
                      {field.options!.map((opt) => (
                        <label
                          key={opt}
                          className="flex items-center justify-between gap-4 px-4 py-3"
                        >
                          <span className="text-sm text-navy">{opt}</span>
                          <div className="flex shrink-0 items-center gap-1">
                            <span className="text-sm text-muted">$</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={draft[field.name]?.[opt] ?? "0"}
                              onChange={(e) =>
                                setOptionPrice(
                                  selected.id,
                                  field.name,
                                  opt,
                                  e.target.value
                                )
                              }
                              className="w-24 rounded-lg border border-border bg-white px-2 py-1.5 text-right text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                        </label>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              <div className="mt-8 flex items-center gap-4 border-t border-border pt-6">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy/90 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Saving…
                    </>
                  ) : (
                    <>
                      <Check size={16} /> Save prices
                    </>
                  )}
                </button>
                <span className="text-xs text-muted">
                  Storefront shows {formatPriceLabel(previewStart)}
                </span>
              </div>
            </>
          ) : (
            <p className="text-muted">Select a business card to edit prices.</p>
          )}
        </div>
      </div>
    </div>
  );
}
