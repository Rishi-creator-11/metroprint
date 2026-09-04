"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { formatPrice, getProductDisplayPrice } from "@/lib/products/product-prices";
import { ProductAddToCart } from "@/components/products/ProductAddToCart";
import { ApparelColorPreview } from "@/components/products/ApparelColorPreview";
import { Badge } from "@/components/ui/Badge";
import {
  garmentShapeForSlug,
  getColorField,
  isApparelProduct,
} from "@/lib/products/apparel";
import type { Product } from "@/lib/types";

/**
 * Product detail layout: preview column (live apparel colour, variant images, or
 * the product photo) + the configure / add-to-cart panel.
 */
export function ProductConfigurator({
  product,
  eyebrow,
}: {
  product: Product;
  eyebrow?: string;
}) {
  const [options, setOptions] = useState<Record<string, string>>({});

  const variantImages = useMemo(() => product.variant_images ?? {}, [product.variant_images]);
  const colorField = getColorField(product.options_schema);
  const selectedColor = colorField ? options[colorField.name] : undefined;
  const apparel = isApparelProduct(product);
  const garment = garmentShapeForSlug(product.slug);

  const variantPhoto = selectedColor ? variantImages[selectedColor] : undefined;
  const currentImage = variantPhoto || product.image_url || null;

  const thumbs = useMemo(() => {
    const seen = new Set<string>();
    const list: { url: string; label: string }[] = [];
    if (product.image_url) {
      list.push({ url: product.image_url, label: product.title });
      seen.add(product.image_url);
    }
    for (const [label, url] of Object.entries(variantImages)) {
      if (url && !seen.has(url)) {
        list.push({ url, label });
        seen.add(url);
      }
    }
    return list;
  }, [product.image_url, product.title, variantImages]);

  const [pinnedThumb, setPinnedThumb] = useState<string | null>(null);
  const shownImage = pinnedThumb ?? currentImage;

  const displayPrice = getProductDisplayPrice(product.slug, product.price, product.pricing_rules, {
    category: product.category,
    optionsSchema: product.options_schema,
  });
  const isLargeFormat = product.category === "Large Format";
  // Show the live colour preview for apparel unless we have a real photo for that colour.
  const showColorPreview = apparel && colorField && !variantPhoto;

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="flex items-center gap-2">
          {eyebrow && <p className="text-sm font-semibold text-primary">{eyebrow}</p>}
          {product.featured_rank != null && <Badge tone="featured">★ Popular</Badge>}
        </div>
        <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight text-navy sm:text-3xl">{product.title}</h1>
        {displayPrice > 0 && (
          <p className="mt-2 text-sm text-muted">
            From{" "}
            <span className="text-xl font-extrabold text-primary">{formatPrice(displayPrice)}</span>
          </p>
        )}
        <p className="mt-3 max-w-prose text-sm text-muted">{product.description}</p>

        <div
          className={`relative mt-5 aspect-square overflow-hidden rounded-2xl border border-border ${
            showColorPreview ? "bg-gradient-to-b from-surface to-white" : isLargeFormat ? "bg-white p-6" : "bg-surface"
          }`}
        >
          {showColorPreview ? (
            <div className="absolute inset-0 grid place-items-center p-8">
              <ApparelColorPreview shape={garment} color={selectedColor} title={product.title} />
            </div>
          ) : shownImage ? (
            <Image
              key={shownImage}
              src={shownImage}
              alt={selectedColor ? `${product.title} — ${selectedColor}` : product.title}
              fill
              className={`transition-opacity duration-300 ${isLargeFormat ? "object-contain" : "object-cover"}`}
              sizes="(max-width: 1024px) 100vw, 45vw"
              priority
            />
          ) : (
            <div className="grid h-full place-items-center text-sm text-muted">Product image coming soon</div>
          )}
        </div>

        {showColorPreview && (
          <div className="mt-3 space-y-1">
            {selectedColor && (
              <p className="text-sm text-muted">
                Showing: <span className="font-semibold text-navy">{selectedColor}</span>
              </p>
            )}
            <p className="text-xs text-muted">
              A mockup preview — on-screen colour may vary slightly from the finished print.
            </p>
          </div>
        )}

        {!showColorPreview && thumbs.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {thumbs.map((t) => (
              <button
                key={t.url}
                type="button"
                onMouseEnter={() => setPinnedThumb(t.url)}
                onMouseLeave={() => setPinnedThumb(null)}
                onClick={() => setPinnedThumb((p) => (p === t.url ? null : t.url))}
                title={t.label}
                aria-label={`Preview ${t.label}`}
                className={`relative h-14 w-14 overflow-hidden rounded-xl border transition-colors ${
                  shownImage === t.url ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/50"
                }`}
              >
                <Image src={t.url} alt="" fill className="object-cover" sizes="56px" />
              </button>
            ))}
          </div>
        )}
      </div>

      <ProductAddToCart product={product} onOptionsChange={setOptions} />
    </div>
  );
}
