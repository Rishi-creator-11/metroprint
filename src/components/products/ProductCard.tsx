import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/product-prices";
import type { Product } from "@/lib/types";

export function ProductCard({ product, href }: { product: Product; href?: string }) {
  const resolvedHref = href ?? `/products/${product.slug}`;

  return (
    <Link
      href={resolvedHref}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white transition-all hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-surface">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 20vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            No image
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">
          {product.subcategory
            ? `${product.category} — ${product.subcategory}`
            : product.category}
        </p>
        <h3 className="mt-1 font-semibold text-navy group-hover:text-primary">
          {product.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted">
          {product.description}
        </p>
        {product.price > 0 ? (
          <p className="mt-auto pt-3 text-base font-bold text-primary">
            {formatPrice(product.price)}
          </p>
        ) : (
          <p className="mt-auto pt-3 text-sm font-medium text-muted">
            {product.base_price_text}
          </p>
        )}
      </div>
    </Link>
  );
}
