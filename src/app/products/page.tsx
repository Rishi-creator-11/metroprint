import SiteLayout from "@/components/layout/SiteLayout";
import { ProductCard } from "@/components/products/ProductCard";
import { getProducts, getCategories } from "@/lib/products";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const metadata = {
  title: "Products — MetroPrint USA",
  description: "Browse our custom printing, apparel, and marketing services.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const products = await getProducts();
  const categories = await getCategories();

  const filtered = category
    ? products.filter((p) => p.category === category)
    : products;

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy">Our Products</h1>
          <p className="mt-2 text-muted">
            Browse our full catalog with clear pricing. Configure your options,
            upload artwork, and checkout securely online.
          </p>
        </div>

        {/* Category filter */}
        <div className="mb-8 flex flex-wrap gap-2">
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
          {categories.map((cat) => {
            const isBusinessCards = cat === "Business Cards";
            const href = isBusinessCards
              ? "/business-cards"
              : `/products?category=${encodeURIComponent(cat)}`;
            return (
              <Link
                key={cat}
                href={href}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  category === cat
                    ? "bg-primary text-white"
                    : "bg-surface text-muted hover:bg-slate-200"
                )}
              >
                {cat}
              </Link>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <p className="text-muted">No products found in this category.</p>
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
