import Link from "next/link";
import SiteLayout from "@/components/layout/SiteLayout";
import { ProductCard } from "@/components/products/ProductCard";
import { CategoryTabs } from "@/components/products/CategoryTabs";
import { Reveal } from "@/components/ui/Reveal";
import { getProducts } from "@/lib/products/products";
import { getStorefrontCategories } from "@/lib/products/categories";
import { SITE_NAME } from "@/lib/constants";
import type { Product } from "@/lib/types";

export const metadata = {
  title: "Products",
  description: `Browse printing, apparel, large-format and marketing services from ${SITE_NAME}.`,
};

const BUSINESS_CARD_LINES = [
  { key: "standard", label: "Standard", match: (p: Product) => p.slug.startsWith("business-cards-standard") },
  { key: "premium", label: "Premium", match: (p: Product) => p.slug.startsWith("business-cards-premium") },
  { key: "specialty", label: "Custom", match: (p: Product) => p.slug.startsWith("business-cards-specialty") },
] as const;

function groupBusinessCards(products: Product[]) {
  return BUSINESS_CARD_LINES.map((line) => ({
    label: `${line.label} Business Cards`,
    products: products.filter(line.match),
  })).filter((g) => g.products.length > 0);
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; line?: string }>;
}) {
  const { category, line } = await searchParams;
  const [products, categories] = await Promise.all([getProducts(), getStorefrontCategories()]);

  const filtered = category ? products.filter((p) => p.category === category) : products;
  const isBusinessCards = category === "Business Cards";
  const activeCategory = categories.find((c) => c.name === category);

  const lineMatcher = line ? BUSINESS_CARD_LINES.find((l) => l.key === line) : undefined;
  const bcProducts = isBusinessCards
    ? lineMatcher
      ? filtered.filter((p) => lineMatcher.match(p))
      : filtered
    : [];
  const bcGroups = isBusinessCards && !line ? groupBusinessCards(filtered) : null;

  const grid = "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  return (
    <SiteLayout>
      {/* header */}
      <section className="border-b border-border bg-gradient-to-b from-surface to-white">
        <div className="mp-container py-10 sm:py-12">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            {category ? "Category" : "Catalog"}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
            {category ?? "All products"}
          </h1>
          <p className="mt-2 max-w-2xl text-muted">
            {activeCategory?.description ??
              "Configurable products with upfront pricing — pick your options, upload artwork, check out securely."}
          </p>
          <p className="mt-3 text-sm font-medium text-muted">
            {filtered.length} product{filtered.length === 1 ? "" : "s"}
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
          <div className="mb-8 flex flex-wrap gap-2 border-b border-border pb-6">
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

        {filtered.length === 0 ? (
          <EmptyState />
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
                <h2 className="mb-5 text-xl font-bold text-navy">{group.label}</h2>
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

function EmptyState({ label = "No products in this category yet." }: { label?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-16 text-center">
      <p className="text-3xl">🗂️</p>
      <p className="mt-3 font-medium text-navy">{label}</p>
      <p className="mt-1 text-sm text-muted">Try another category, or browse everything.</p>
      <Link
        href="/products"
        className="mt-4 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
      >
        View all products
      </Link>
    </div>
  );
}
