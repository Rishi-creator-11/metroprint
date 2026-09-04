import Link from "next/link";
import SiteLayout from "@/components/layout/SiteLayout";
import { ProductCard } from "@/components/products/ProductCard";
import { CategoryTabs } from "@/components/products/CategoryTabs";
import { CatalogControls } from "@/components/products/CatalogControls";
import { Reveal } from "@/components/ui/Reveal";
import { getProducts } from "@/lib/products/products";
import { getStorefrontCategories } from "@/lib/products/categories";
import { getProductDisplayPrice } from "@/lib/products/product-prices";
import { SITE_NAME } from "@/lib/constants";
import { X } from "lucide-react";
import type { Product } from "@/lib/types";

export const metadata = {
  title: "Products",
  description: `Browse printing, apparel, large-format and marketing services from ${SITE_NAME}.`,
};

const BUSINESS_CARD_LINES = [
  { key: "standard", label: "Standard", match: (p: Product) => p.slug.startsWith("business-cards-standard") },
  { key: "premium", label: "Premium", match: (p: Product) => p.slug.startsWith("business-cards-premium") },
  { key: "specialty", label: "Specialty", match: (p: Product) => p.slug.startsWith("business-cards-specialty") },
] as const;

function groupBusinessCards(products: Product[]) {
  return BUSINESS_CARD_LINES.map((line) => ({
    label: `${line.label} Business Cards`,
    products: products.filter(line.match),
  })).filter((g) => g.products.length > 0);
}

function sortProducts(products: Product[], sort: string): Product[] {
  if (sort === "name") {
    return [...products].sort((a, b) => a.title.localeCompare(b.title));
  }
  if (sort === "price") {
    const priceOf = (p: Product) =>
      getProductDisplayPrice(p.slug, p.price, p.pricing_rules, {
        category: p.category,
        optionsSchema: p.options_schema,
      });
    return [...products].sort((a, b) => priceOf(a) - priceOf(b));
  }
  return products; // "featured" — already category → admin sort_order → title from getProducts()
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; line?: string; q?: string; sort?: string }>;
}) {
  const { category, line, q, sort = "featured" } = await searchParams;
  const [products, categories] = await Promise.all([getProducts(), getStorefrontCategories()]);

  const query = q?.trim().toLowerCase() ?? "";
  const byCategory = category ? products.filter((p) => p.category === category) : products;
  const searched = query
    ? byCategory.filter(
        (p) => p.title.toLowerCase().includes(query) || p.description?.toLowerCase().includes(query),
      )
    : byCategory;
  const filtered = sortProducts(searched, sort);

  const isBusinessCards = category === "Business Cards";
  const activeCategory = categories.find((c) => c.name === category);

  const lineMatcher = line ? BUSINESS_CARD_LINES.find((l) => l.key === line) : undefined;
  const bcProducts = isBusinessCards
    ? lineMatcher
      ? filtered.filter((p) => lineMatcher.match(p))
      : filtered
    : [];
  const bcGroups = isBusinessCards && !line && !query ? groupBusinessCards(filtered) : null;

  const grid = "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  const clearHref = category ? `/products?category=${encodeURIComponent(category)}` : "/products";
  const hasQuery = query.length > 0;

  return (
    <SiteLayout>
      {/* header */}
      <section className="border-b border-border bg-gradient-to-b from-surface to-background">
        <div className="mp-container py-10 sm:py-12">
          <p className="flex items-center gap-2 text-sm font-semibold text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
            {category ? "Category" : "Catalog"}
          </p>
          <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
            {category ?? "All products"}
          </h1>
          <p className="mt-2 max-w-2xl text-muted">
            {activeCategory?.description ??
              "Configurable products with upfront pricing — pick your options, upload artwork, check out securely."}
          </p>
        </div>
      </section>

      <div className="mp-container py-8 sm:py-10">
        <CategoryTabs
          categories={categories.map((c) => ({
            name: c.name,
            href: c.href ?? `/products?category=${encodeURIComponent(c.name)}`,
          }))}
          active={category ?? null}
        />

        {isBusinessCards && (
          <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-6">
            <BcTab href="/products?category=Business%20Cards" label="All types" active={!line} />
            {BUSINESS_CARD_LINES.map((l) => (
              <BcTab
                key={l.key}
                href={`/products?category=Business%20Cards&line=${l.key}`}
                label={l.label}
                active={line === l.key}
              />
            ))}
          </div>
        )}

        <div className="mb-6">
          <CatalogControls resultCount={isBusinessCards && line ? bcProducts.length : filtered.length} />
          {hasQuery && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted">Filtered by:</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
                &ldquo;{q}&rdquo;
                <Link href={clearHref} aria-label="Clear search" className="hover:text-primary-dark">
                  <X size={13} />
                </Link>
              </span>
              <Link href={clearHref} className="text-muted underline-offset-2 hover:text-primary hover:underline">
                Clear all
              </Link>
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
          <EmptyState hasQuery={hasQuery} query={q} />
        ) : isBusinessCards && line ? (
          bcProducts.length === 0 ? (
            <EmptyState label="Nothing in this line yet." />
          ) : (
            <Reveal className={grid}>
              {bcProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </Reveal>
          )
        ) : isBusinessCards && bcGroups && bcGroups.length > 0 ? (
          <div className="space-y-12">
            {bcGroups.map((group) => (
              <section key={group.label}>
                <h2 className="font-display mb-5 text-xl font-semibold text-navy">{group.label}</h2>
                <Reveal className={grid}>
                  {group.products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </Reveal>
              </section>
            ))}
          </div>
        ) : (
          <Reveal className={grid}>
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </Reveal>
        )}
      </div>
    </SiteLayout>
  );
}

function BcTab({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
        active ? "bg-navy text-white" : "bg-white text-muted ring-1 ring-border hover:text-navy"
      }`}
    >
      {label}
    </Link>
  );
}

function EmptyState({
  label,
  hasQuery,
  query,
}: {
  label?: string;
  hasQuery?: boolean;
  query?: string;
}) {
  const heading = label ?? (hasQuery ? `No products match “${query}”.` : "No products in this category yet.");
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-16 text-center">
      <p className="text-3xl" aria-hidden="true">
        🗂️
      </p>
      <p className="mt-3 font-medium text-navy">{heading}</p>
      <p className="mt-1 text-sm text-muted">Try a different search term, or browse everything.</p>
      <Link
        href="/products"
        className="mt-4 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
      >
        View all products
      </Link>
    </div>
  );
}
