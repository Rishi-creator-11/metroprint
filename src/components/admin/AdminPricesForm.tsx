"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/product-prices";
import type { ProductCategory } from "@/lib/types";

interface PriceRow {
  id: string;
  title: string;
  slug: string;
  category: ProductCategory;
  price: number;
  active: boolean;
}

export function AdminPricesForm({ products }: { products: PriceRow[] }) {
  const [rows, setRows] = useState(
    products.map((p) => ({ ...p, draft: String(p.price) }))
  );
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = async (id: string) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return;

    const price = Number(row.draft);
    if (!Number.isFinite(price) || price <= 0) {
      setMessage("Enter a valid price greater than zero.");
      return;
    }

    setSavingId(id);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Could not save price");
      }

      setRows((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, price: data.price, draft: String(data.price) }
            : r
        )
      );
      setMessage(`Updated ${row.title}`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSavingId(null);
    }
  };

  const categories = [...new Set(rows.map((r) => r.category))];

  return (
    <div className="space-y-8">
      {message && (
        <p className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted">
          {message}
        </p>
      )}

      {categories.map((category) => (
        <section key={category}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            {category}
          </h2>
          <div className="overflow-hidden rounded-xl border border-border bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-surface text-left text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Current</th>
                  <th className="px-4 py-3 font-medium">New price (USD)</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {rows
                  .filter((r) => r.category === category)
                  .map((row) => (
                    <tr key={row.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-medium text-navy">{row.title}</p>
                        {!row.active && (
                          <p className="text-xs text-red-600">Inactive</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {formatPrice(row.price)}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={row.draft}
                          onChange={(e) =>
                            setRows((prev) =>
                              prev.map((r) =>
                                r.id === row.id
                                  ? { ...r, draft: e.target.value }
                                  : r
                              )
                            )
                          }
                          className="w-28 rounded-lg border border-border px-3 py-2"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleSave(row.id)}
                          disabled={savingId === row.id}
                          className="rounded-lg bg-navy px-3 py-2 text-white hover:bg-navy/90 disabled:opacity-50"
                        >
                          {savingId === row.id ? "Saving…" : "Save"}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
