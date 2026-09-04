import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ImageOff } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, getProductDisplayPrice } from "@/lib/products/product-prices";
import type { Product } from "@/lib/types";

export function ProductCard({ product, href }: { product: Product; href?: string }) {
  const resolvedHref = href ?? `/products/${product.slug}`;
  const displayPrice = getProductDisplayPrice(product.slug, product.price, product.pricing_rules, {
    category: product.category,
    optionsSchema: product.options_schema,
  });
  const isLargeFormat = product.category === "Large Format";
  const featured = product.featured_rank != null;

  return (
    <Link
      href={resolvedHref}
      className="card-hover group flex flex-col overflow-hidden rounded-2xl border border-border bg-white"
    >
      <div className={`relative aspect-square overflow-hidden ${isLargeFormat ? "bg-white p-5" : "bg-surface"}`}>
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            className={`transition-transform duration-500 group-hover:scale-[1.06] ${
              isLargeFormat ? "object-contain" : "object-cover"
            }`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="grid h-full place-items-center gap-1.5 text-muted">
            <ImageOff size={22} aria-hidden="true" />
            <span className="text-xs">Image coming soon</span>
          </div>
        )}
        {featured && (
          <div className="absolute left-3 top-3">
            <Badge tone="featured">★ Popular</Badge>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold text-primary">
          {product.subcategory ? `${product.category} · ${product.subcategory}` : product.category}
        </p>
        <h3 className="mt-1 font-semibold leading-snug text-navy transition-colors group-hover:text-primary">
          {product.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{product.description}</p>

        <div className="mt-auto flex items-end justify-between pt-3">
          {displayPrice > 0 ? (
            <p className="text-sm text-muted">
              From <span className="text-base font-bold text-navy">{formatPrice(displayPrice)}</span>
            </p>
          ) : (
            <p className="text-sm font-medium text-muted">{product.base_price_text}</p>
          )}
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-primary transition-colors group-hover:bg-primary group-hover:text-white">
            <ArrowUpRight size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
}
