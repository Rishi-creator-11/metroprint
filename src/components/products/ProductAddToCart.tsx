"use client";

import { useMemo, useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ArtworkUpload } from "@/components/products/ArtworkUpload";
import { useCart } from "@/components/cart/CartProvider";
import {
  formatPrice,
  getProductDisplayPrice,
} from "@/lib/product-prices";
import { calculateLinePrice } from "@/lib/pricing";
import type { ArtworkFile } from "@/lib/artwork";
import type { Product, OptionField } from "@/lib/types";

function DynamicField({
  field,
  value,
  onChange,
}: {
  field: OptionField;
  value: string;
  onChange: (value: string) => void;
}) {
  const baseClass =
    "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

  if (field.type === "select") {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={field.required}
        className={baseClass}
      >
        <option value="">Select {field.label.toLowerCase()}</option>
        {field.options?.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "radio") {
    return (
      <div className="flex flex-wrap gap-4">
        {field.options?.map((opt) => (
          <label key={opt} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name={field.name}
              value={opt}
              checked={value === opt}
              onChange={(e) => onChange(e.target.value)}
              required={field.required}
            />
            {opt}
          </label>
        ))}
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        required={field.required}
        rows={3}
        className={baseClass}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      required={field.required}
      className={baseClass}
    />
  );
}

export function ProductAddToCart({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [options, setOptions] = useState<Record<string, string>>({});
  const [artworkFiles, setArtworkFiles] = useState<ArtworkFile[]>([]);
  const [uploadingArtwork, setUploadingArtwork] = useState(false);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  const priceResult = useMemo(
    () =>
      calculateLinePrice(product.price, product.pricing_rules, options, {
        slug: product.slug,
        category: product.category,
        optionsSchema: product.options_schema,
      }),
    [
      product.price,
      product.pricing_rules,
      product.slug,
      product.category,
      product.options_schema,
      options,
    ]
  );

  const displayFrom = getProductDisplayPrice(
    product.slug,
    product.price,
    product.pricing_rules,
    { category: product.category, optionsSchema: product.options_schema }
  );

  const hasSelection = Object.values(options).some(Boolean);

  const handleAdd = () => {
    const required = product.options_schema.fields.filter((f) => f.required);
    for (const field of required) {
      if (!options[field.name]) {
        setError(`Please select ${field.label.toLowerCase()}.`);
        return;
      }
    }

    if (uploadingArtwork) {
      setError("Please wait for your artwork to finish uploading.");
      return;
    }

    addItem({
      product_slug: product.slug,
      product_title: product.title,
      category: product.category,
      selected_options: options,
      unit_price: priceResult.unitPrice,
      quantity: priceResult.orderQuantity,
      line_total: priceResult.lineTotal,
      is_tier_pricing: priceResult.isTierPricing,
      image_url: product.image_url,
      artwork_files: artworkFiles,
    });

    setError("");
    setAdded(true);
    setArtworkFiles([]);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h2 className="text-xl font-semibold text-navy">Configure & Add</h2>
        <div className="text-right">
          {hasSelection ? (
            <p className="text-2xl font-bold text-primary">
              {formatPrice(priceResult.lineTotal)}
            </p>
          ) : (
            <>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                From
              </p>
              <p className="text-2xl font-bold text-primary">
                {formatPrice(displayFrom)}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {product.options_schema.fields.map((field) => (
          <div key={field.name}>
            <label className="mb-1.5 block text-sm font-medium text-navy">
              {field.label}
              {field.required && <span className="text-red-500"> *</span>}
            </label>
            <DynamicField
              field={field}
              value={options[field.name] || ""}
              onChange={(val) =>
                setOptions((prev) => ({ ...prev, [field.name]: val }))
              }
            />
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-border pt-6">
        <ArtworkUpload
          files={artworkFiles}
          onChange={setArtworkFiles}
          onUploadingChange={setUploadingArtwork}
        />
      </div>

      {hasSelection && (
        <p className="mt-4 text-sm text-muted">
          {priceResult.isTierPricing ? (
            <>
              Total for{" "}
              <span className="font-semibold text-navy">
                {options.quantity || priceResult.orderQuantity} units
              </span>
              :{" "}
              <span className="font-semibold text-navy">
                {formatPrice(priceResult.lineTotal)}
              </span>
            </>
          ) : priceResult.orderQuantity > 1 ? (
            <>
              Estimated total:{" "}
              <span className="font-semibold text-navy">
                {formatPrice(priceResult.lineTotal)}
              </span>
              <span className="ml-1">
                ({formatPrice(priceResult.unitPrice)} × {priceResult.orderQuantity})
              </span>
            </>
          ) : null}
        </p>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      )}

      {added && (
        <p className="mt-4 flex items-center gap-2 text-sm text-green-700">
          <Check size={16} /> Added to cart!
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={handleAdd} disabled={uploadingArtwork} className="flex-1 sm:flex-none">
          <ShoppingCart size={18} /> Add to Cart
        </Button>
        <Button href="/cart" variant="outline">
          View Cart
        </Button>
      </div>
    </div>
  );
}
