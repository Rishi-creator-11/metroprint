import SiteLayout from "@/components/layout/SiteLayout";
import { ProductCard } from "@/components/products/ProductCard";
import { getProducts, getCategories } from "@/lib/products";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { Product } from "@/lib/types";

export const metadata = {
  title: "Products — MetroPrint USA",
  description: "Browse our custom printing, apparel, and marketing services.",
};

const BUSINESS_CARD_LINES = [
  {
    key: "standard",
    label: "Standard",
    match: (p: Product) => p.slug.startsWith("business-cards-standard"),
  },
  {
    key: "premium",
    label: "Premium",
    match: (p: Product) => p.slug.startsWith("business-cards-premium"),
  },
  {
    key: "specialty",
    label: "Custom",
    match: (p: Product) => p.slug.startsWith("business-cards-specialty"),
  },
] as const;

function groupBusinessCards(products: Product[]) {
  return BUSINESS_CARD_LINES.map((line) => ({
    label: `${line.label} Business Cards`,
    products: products.filter(line.match),
  })).filter((g) => g.products.length > 0);
}

function businessCardsQuery(category: string, line?: string) {
  const params = new URLSearchParams({ category });
  if (line) params.set("line", line);
  return `/products?${params.toString()}`;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; line?: string }>;
}) {
  const { category, line } = await searchParams;
  const products = await getProducts();
  const categories = await getCategories();

  const filtered = category
    ? products.filter((p) => p.category === category)
    : products;

  const isBusinessCards = category === "Business Cards";
  const lineMatcher = line
    ? BUSINESS_CARD_LINES.find((l) => l.key === line)
    : undefined;

  const businessCardProducts = isBusinessCards
    ? lineMatcher
      ? filtered.filter((p) => lineMatcher.match(p))
      : filtered
    : [];

  const businessCardGroups =
    isBusinessCards && !line ? groupBusinessCards(filtered) : null;

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy">Our Products</h1>
          <p className="mt-2 text-muted">
            Browse our full catalog with clear pricing. Configure your options,
            upload artwork, and checkout securely online.
          </p>
          {isBusinessCards && (
            <p className="mt-2 text-sm text-primary">
              MetroPrint USA business cards — product line MKT1
            </p>
          )}
        </div>

        {/* Category filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            href="/products"
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              !category
                ? "bg-primary text-white"
                : "bg-surface text-muted hover:bg-slate-200"
            )}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/products?category=${encodeURIComponent(cat)}`}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                category === cat
                  ? "bg-primary text-white"
                  : "bg-surface text-muted hover:bg-slate-200"
              )}
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* Business card subcategories */}
        {isBusinessCards && (
          <div className="mb-8 flex flex-wrap gap-2 border-b border-border pb-6">
            <Link
              href={businessCardsQuery("Business Cards")}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                !line
                  ? "bg-navy text-white"
                  : "bg-white text-muted ring-1 ring-border hover:text-navy"
              )}
            >
              All types
            </Link>
            {BUSINESS_CARD_LINES.map((item) => (
              <Link
                key={item.key}
                href={businessCardsQuery("Business Cards", item.key)}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                  line === item.key
                    ? "bg-navy text-white"
                    : "bg-white text-muted ring-1 ring-border hover:text-navy"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <p className="text-muted">No products found in this category.</p>
        ) : isBusinessCards && line ? (
          businessCardProducts.length === 0 ? (
            <p className="text-muted">No products found in this subcategory.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {businessCardProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )
        ) : isBusinessCards && businessCardGroups && businessCardGroups.length > 0 ? (
          <div className="space-y-10">
            {businessCardGroups.map((group) => (
              <section key={group.label}>
                <h2 className="mb-4 text-xl font-bold text-navy">{group.label}</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {group.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
