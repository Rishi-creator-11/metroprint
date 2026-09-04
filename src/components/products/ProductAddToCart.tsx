"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { ShoppingCart, Check, ArrowRight, Wand2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ArtworkUpload } from "@/components/products/ArtworkUpload";
import { ColorSwatches } from "@/components/products/ColorSwatches";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice, getProductDisplayPrice } from "@/lib/products/product-prices";
import { calculateLinePrice } from "@/lib/pricing/pricing";
import { isStudioProduct } from "@/lib/studio/print-specs";
import { toCartRef, type StudioDesign } from "@/lib/studio/design";
import { setStudioIntent, readStudioResult, clearStudioResult } from "@/lib/studio/handoff";
import type { ArtworkFile } from "@/lib/checkout/artwork";
import type { Product, OptionField } from "@/lib/types";

const inputClass =
  "w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25";

/** A select field short enough to render as a button group instead of a dropdown. */
function isButtonGroup(field: OptionField) {
  const opts = field.options ?? [];
  return field.type === "select" && opts.length > 0 && opts.length <= 10 && opts.every((o) => o.length <= 26);
}

function ButtonGroup({
  options,
  value,
  onChange,
  columns = 3,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  columns?: number;
}) {
  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      role="radiogroup"
    >
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt)}
            className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
              selected
                ? "border-primary bg-primary/5 text-primary shadow-sm ring-1 ring-primary"
                : "border-border bg-white text-navy hover:border-primary/50 hover:bg-surface"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function RadioCards({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-3" role="radiogroup">
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt)}
            className={`flex items-center justify-center rounded-xl border px-3 py-3 text-center text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
              selected
                ? "border-primary bg-primary text-white shadow-sm"
                : "border-border bg-white text-navy hover:border-primary/50 hover:bg-surface"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function DynamicField({
  field,
  value,
  onChange,
}: {
  field: OptionField;
  value: string;
  onChange: (value: string) => void;
}) {
  if (field.type === "select" && field.name.endsWith("_color")) {
    return (
      <ColorSwatches
        label={field.label}
        options={field.options ?? []}
        value={value}
        onChange={onChange}
        required={field.required}
      />
    );
  }

  if (field.type === "radio") {
    return <RadioCards options={field.options ?? []} value={value} onChange={onChange} />;
  }

  if (isButtonGroup(field)) {
    const cols = (field.options ?? []).length <= 4 ? (field.options ?? []).length : 3;
    return <ButtonGroup options={field.options ?? []} value={value} onChange={onChange} columns={cols} />;
  }

  if (field.type === "select") {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} required={field.required} className={inputClass}>
        <option value="">Select {field.label.toLowerCase()}</option>
        {field.options?.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
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
        className={inputClass}
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
      className={inputClass}
    />
  );
}

export function ProductAddToCart({
  product,
  onOptionsChange,
}: {
  product: Product;
  /** Notified whenever the customer's selections change (e.g. to swap the image). */
  onOptionsChange?: (options: Record<string, string>) => void;
}) {
  const { addItem } = useCart();
  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const [options, setOptions] = useState<Record<string, string>>({});
  const [artworkFiles, setArtworkFiles] = useState<ArtworkFile[]>([]);
  const [uploadingArtwork, setUploadingArtwork] = useState(false);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);
  const [design, setDesign] = useState<StudioDesign | null>(null);
  const [designThumb, setDesignThumb] = useState<string | null>(null);

  const usesStudio = isStudioProduct(product.slug);

  useEffect(() => {
    onOptionsChange?.(options);
  }, [options, onOptionsChange]);

  // Pick up a design the customer just finished in the studio.
  useEffect(() => {
    if (!usesStudio) return;
    const result = readStudioResult(product.slug);
    if (result?.design) {
      setDesign(result.design);
      setDesignThumb(result.thumbnailUrl);
      if (result.design.selectedOptions) {
        setOptions((prev) => ({ ...prev, ...result.design.selectedOptions }));
      }
      clearStudioResult(product.slug);
    }
  }, [usesStudio, product.slug]);

  const openStudio = () => {
    setStudioIntent({
      slug: product.slug,
      selectedOptions: options,
      returnTo: pathname || `/products/${product.slug}`,
    });
    router.push(`/studio/${product.slug}`);
  };

  const priceResult = useMemo(
    () =>
      calculateLinePrice(product.price, product.pricing_rules, options, {
        slug: product.slug,
        category: product.category,
        optionsSchema: product.options_schema,
      }),
    [product.price, product.pricing_rules, product.slug, product.category, product.options_schema, options],
  );

  const displayFrom = getProductDisplayPrice(product.slug, product.price, product.pricing_rules, {
    category: product.category,
    optionsSchema: product.options_schema,
  });

  const hasSelection = Object.values(options).some(Boolean);
  const isCustomOrder = priceResult.requiresQuote;

  const handleAdd = () => {
    if (isCustomOrder) {
      setError("Custom quantities require a quote. Use Request Quote instead.");
      return;
    }
    const required = product.options_schema.fields.filter((f) => f.required);
    for (const field of required) {
      if (!options[field.name]) {
        setError(`Please choose ${field.label.toLowerCase()}.`);
        return;
      }
    }
    if (uploadingArtwork) {
      setError("Please wait for your artwork to finish uploading.");
      return;
    }

    const colorField = product.options_schema.fields.find((f) => f.name.endsWith("_color"));
    const chosen = colorField ? options[colorField.name] : undefined;
    const variantImage = chosen ? product.variant_images?.[chosen] : undefined;

    addItem({
      product_slug: product.slug,
      product_title: product.title,
      category: product.category,
      selected_options: options,
      unit_price: priceResult.unitPrice,
      quantity: priceResult.orderQuantity,
      line_total: priceResult.lineTotal,
      is_tier_pricing: priceResult.isTierPricing,
      image_url: designThumb || variantImage || product.image_url,
      artwork_files: artworkFiles,
      ...(design ? { design: toCartRef(design, designThumb), design_full: design } : {}),
    });

    setError("");
    setAdded(true);
    setArtworkFiles([]);
    setDesign(null);
    setDesignThumb(null);
    toast.success(`${product.title} added to cart`);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="rounded-2xl border border-border bg-white shadow-md">
      <div className="flex items-baseline justify-between gap-4 border-b border-border px-6 py-5 sm:px-7">
        <h2 className="text-base font-bold text-navy">Configure &amp; add</h2>
        <div className="text-right">
          {isCustomOrder ? (
            <p className="text-sm font-semibold text-navy">Quote required</p>
          ) : (
            <>
              {!hasSelection && (
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">From</p>
              )}
              <p className="text-2xl font-extrabold text-primary">
                {formatPrice(hasSelection ? priceResult.lineTotal : displayFrom)}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="space-y-5 px-6 py-6 sm:px-7">
        {product.options_schema.fields.map((field) => (
          <div key={field.name}>
            <label className="mb-2 block text-sm font-semibold text-navy">
              {field.label}
              {field.required && <span className="text-danger"> *</span>}
            </label>
            <DynamicField
              field={field}
              value={options[field.name] || ""}
              onChange={(val) => setOptions((prev) => ({ ...prev, [field.name]: val }))}
            />
          </div>
        ))}

        <div className="border-t border-border pt-5">
          {usesStudio ? (
            <div>
              <p className="mb-2 block text-sm font-semibold text-navy">Artwork</p>
              {design ? (
                <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3">
                  {designThumb && (
                    <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-white">
                      <Image src={designThumb} alt="Your design" fill className="object-contain" sizes="56px" unoptimized />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-navy">
                      <Check size={14} className="text-success" /> Artwork ready
                    </p>
                    <button type="button" onClick={openStudio} className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                      <Pencil size={12} /> Edit design
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-surface p-4 text-center">
                  <Wand2 className="mx-auto text-primary" size={22} />
                  <p className="mt-2 text-sm font-medium text-navy">Design in our Print Studio</p>
                  <p className="mt-0.5 text-xs text-muted">Upload art, set bleed &amp; safe area, preview both sides.</p>
                  <button
                    type="button"
                    onClick={openStudio}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy/90"
                  >
                    <Wand2 size={15} /> Open Design Studio
                  </button>
                  <p className="mt-2 text-[11px] text-muted">or attach a print-ready file below</p>
                  <div className="mt-3 text-left">
                    <ArtworkUpload files={artworkFiles} onChange={setArtworkFiles} onUploadingChange={setUploadingArtwork} label="Upload print-ready file" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <ArtworkUpload files={artworkFiles} onChange={setArtworkFiles} onUploadingChange={setUploadingArtwork} />
          )}
        </div>

        {hasSelection && !isCustomOrder && (
          <div className="rounded-xl bg-surface px-4 py-3 text-sm text-muted">
            {priceResult.isTierPricing ? (
              <>
                Total for{" "}
                <span className="font-semibold text-navy">
                  {options.quantity || priceResult.orderQuantity} units
                </span>{" "}
                — <span className="font-semibold text-navy">{formatPrice(priceResult.lineTotal)}</span>
              </>
            ) : priceResult.orderQuantity > 1 ? (
              <>
                <span className="font-semibold text-navy">{formatPrice(priceResult.lineTotal)}</span>{" "}
                <span>
                  ({formatPrice(priceResult.unitPrice)} × {priceResult.orderQuantity})
                </span>
              </>
            ) : null}
          </div>
        )}

        {isCustomOrder && (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            For quantities above 10,000 or other custom runs, request a quote and our team
            will follow up with pricing.
          </p>
        )}

        {error && <p className="text-sm font-medium text-danger">{error}</p>}
        {added && (
          <p className="flex items-center gap-2 text-sm font-medium text-success">
            <Check size={16} /> Added to cart
          </p>
        )}

        <div className="flex flex-col gap-2.5 sm:flex-row">
          {isCustomOrder ? (
            <Button href="/request-quote" size="lg" className="flex-1">
              Request a quote <ArrowRight size={18} />
            </Button>
          ) : (
            <Button onClick={handleAdd} disabled={uploadingArtwork} size="lg" className="flex-1">
              <ShoppingCart size={18} /> Add to cart
            </Button>
          )}
          <Button href="/cart" variant="secondary" size="lg" className="sm:flex-none">
            View cart
          </Button>
        </div>
      </div>

      {/* Mobile sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-border bg-white/95 px-4 py-3 shadow-[0_-4px_16px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
            {isCustomOrder ? "Custom" : hasSelection ? "Total" : "From"}
          </p>
          <p className="truncate text-lg font-extrabold text-primary">
            {isCustomOrder ? "Quote" : formatPrice(hasSelection ? priceResult.lineTotal : displayFrom)}
          </p>
        </div>
        {isCustomOrder ? (
          <Button href="/request-quote" size="md" className="ml-auto flex-1">
            Request a quote
          </Button>
        ) : (
          <Button onClick={handleAdd} disabled={uploadingArtwork} size="md" className="ml-auto flex-1">
            <ShoppingCart size={16} /> Add to cart
          </Button>
        )}
      </div>
    </div>
  );
}
