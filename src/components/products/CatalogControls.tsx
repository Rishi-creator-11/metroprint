"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "name", label: "Name (A–Z)" },
  { value: "price", label: "Starting price" },
] as const;

/** Search + sort controls for the catalog. Pushes to the URL so the grid stays server-rendered. */
export function CatalogControls({ resultCount }: { resultCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQ(searchParams.get("q") ?? "");
  }, [searchParams]);

  const pushParams = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const onSearchChange = (value: string) => {
    setQ(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushParams({ q: value.trim() || null }), 350);
  };

  const sort = searchParams.get("sort") ?? "featured";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-xs">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          type="search"
          value={q}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products…"
          aria-label="Search products"
          className="w-full rounded-xl border border-border bg-white py-2.5 pl-9 pr-9 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {q && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              pushParams({ q: null });
            }}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted hover:bg-surface hover:text-navy"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-muted" aria-live="polite">
          {resultCount} product{resultCount === 1 ? "" : "s"}
        </span>
        <label className="flex items-center gap-2 text-sm text-muted">
          <span className="hidden sm:inline">Sort</span>
          <select
            value={sort}
            onChange={(e) => pushParams({ sort: e.target.value === "featured" ? null : e.target.value })}
            aria-label="Sort products"
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-navy focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
