import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/admin-server";
import { formatPriceLabel, getProductPrice } from "@/lib/products/product-prices";
import { getStartingPrice, normalizePricingRules } from "@/lib/pricing/pricing";
import { PRODUCT_CATEGORIES } from "@/lib/types";
import type { OptionsSchema, ProductPricingRules } from "@/lib/types";

const RETURN_COLS =
  "id, title, slug, category, subcategory, description, base_price_text, image_url, price, active, sort_order, featured_rank, options_schema, pricing_rules, variant_images, print_specs, created_at";

/** Validate the admin-editable print-spec shape. Empty object clears the override. */
function cleanPrintSpecs(value: unknown): Record<string, unknown> | undefined {
  if (value === undefined) return undefined;
  if (!value || typeof value !== "object") return {};
  return value as Record<string, unknown>;
}

/** Sanitise a { value: url } string map; drops non-string / empty entries. */
function cleanStringMap(value: unknown): Record<string, string> | undefined {
  if (!value || typeof value !== "object") return undefined;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (typeof v === "string" && v.trim()) out[k] = v.trim();
  }
  return out;
}

function parseNullableInt(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : undefined;
}

function isValidOptionsSchema(value: unknown): value is OptionsSchema {
  return (
    !!value &&
    typeof value === "object" &&
    Array.isArray((value as { fields?: unknown }).fields)
  );
}

/**
 * Full product update for the admin Product Manager + Pricing hub.
 * Every field is optional — only supplied fields are written.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;
  const { service } = auth;

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  // --- plain text / flag fields ---
  if (typeof body.title === "string" && body.title.trim()) updates.title = body.title.trim();
  if (typeof body.description === "string") updates.description = body.description;
  if (typeof body.image_url === "string") updates.image_url = body.image_url.trim() || null;
  if (body.subcategory !== undefined) {
    updates.subcategory =
      typeof body.subcategory === "string" && body.subcategory.trim()
        ? body.subcategory.trim()
        : null;
  }
  if (typeof body.active === "boolean") updates.active = body.active;

  const sortOrder = parseNullableInt(body.sort_order);
  if (sortOrder !== undefined) updates.sort_order = sortOrder;
  const featuredRank = parseNullableInt(body.featured_rank);
  if (featuredRank !== undefined) updates.featured_rank = featuredRank;

  if (body.category !== undefined) {
    if (!PRODUCT_CATEGORIES.includes(body.category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }
    updates.category = body.category;
  }

  if (body.options_schema !== undefined) {
    if (!isValidOptionsSchema(body.options_schema)) {
      return NextResponse.json(
        { error: "options_schema must be an object with a `fields` array" },
        { status: 400 },
      );
    }
    updates.options_schema = body.options_schema;
  }

  if (body.variant_images !== undefined) {
    updates.variant_images = cleanStringMap(body.variant_images) ?? {};
  }

  const printSpecs = cleanPrintSpecs(body.print_specs);
  if (printSpecs !== undefined) updates.print_specs = printSpecs;

  // --- pricing fields ---
  let basePrice: number | undefined;
  if (body.price !== undefined) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }
    basePrice = price;
    updates.price = price;
  }

  let pricingRules: ProductPricingRules | undefined;
  if (body.pricing_rules !== undefined) {
    pricingRules = normalizePricingRules(body.pricing_rules) ?? undefined;
    if (pricingRules) updates.pricing_rules = pricingRules;
  }

  const explicitLabel =
    typeof body.base_price_text === "string" && body.base_price_text.trim()
      ? body.base_price_text.trim()
      : undefined;
  if (explicitLabel) updates.base_price_text = explicitLabel;

  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: "No updates" }, { status: 400 });
  }

  // Recompute base_price_text from price/rules unless the caller set it explicitly.
  if (!explicitLabel && (basePrice !== undefined || pricingRules)) {
    const { data: existing } = await service
      .from("products")
      .select("slug, price")
      .eq("id", id)
      .single();
    const slug = existing?.slug ?? "";
    const resolvedBase =
      basePrice ??
      getProductPrice(slug, existing?.price != null ? Number(existing.price) : null);
    const resolvedRules = pricingRules ?? normalizePricingRules(body.pricing_rules) ?? {};
    updates.base_price_text = formatPriceLabel(getStartingPrice(resolvedBase, resolvedRules));
  }

  const { data, error } = await service
    .from("products")
    .update(updates)
    .eq("id", id)
    .select(RETURN_COLS)
    .single();

  if (error) {
    const missingColumn = error.message?.includes("pricing_rules");
    return NextResponse.json(
      {
        error: missingColumn
          ? "Run supabase/migrations/016_product_pricing_rules.sql in Supabase first."
          : error.message,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ...data,
    price: data.price != null ? Number(data.price) : null,
    pricing_rules: normalizePricingRules(data.pricing_rules),
    variant_images: data.variant_images ?? {},
    print_specs: data.print_specs ?? {},
  });
}
