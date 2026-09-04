import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/admin-server";
import { formatPriceLabel, getProductPrice } from "@/lib/products/product-prices";
import { getStartingPrice, normalizePricingRules } from "@/lib/pricing/pricing";
import { PRODUCT_CATEGORIES } from "@/lib/types";
import type { OptionsSchema } from "@/lib/types";

const RETURN_COLS =
  "id, title, slug, category, subcategory, description, base_price_text, image_url, price, active, sort_order, featured_rank, options_schema, pricing_rules, variant_images, print_specs, created_at";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isValidOptionsSchema(value: unknown): value is OptionsSchema {
  return (
    !!value &&
    typeof value === "object" &&
    Array.isArray((value as { fields?: unknown }).fields)
  );
}

/** Create a brand-new product row. */
export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;
  const { service } = auth;

  const body = await request.json();

  const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
  if (!SLUG_RE.test(slug)) {
    return NextResponse.json(
      { error: "Slug must be lowercase words separated by hyphens (e.g. yard-signs)" },
      { status: 400 },
    );
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  if (!PRODUCT_CATEGORIES.includes(body.category)) {
    return NextResponse.json({ error: "Invalid or missing category" }, { status: 400 });
  }

  const { data: clash } = await service
    .from("products")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (clash) {
    return NextResponse.json({ error: `A product with slug "${slug}" already exists` }, { status: 409 });
  }

  const price =
    body.price !== undefined && Number.isFinite(Number(body.price)) && Number(body.price) > 0
      ? Number(body.price)
      : getProductPrice(slug, null);

  const optionsSchema = isValidOptionsSchema(body.options_schema)
    ? body.options_schema
    : { fields: [] };

  const pricingRules =
    body.pricing_rules !== undefined ? normalizePricingRules(body.pricing_rules) : null;

  const explicitLabel =
    typeof body.base_price_text === "string" && body.base_price_text.trim()
      ? body.base_price_text.trim()
      : undefined;

  const toInt = (v: unknown) => {
    if (v === undefined || v === null || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : null;
  };

  const insertRow = {
    title,
    slug,
    category: body.category,
    subcategory:
      typeof body.subcategory === "string" && body.subcategory.trim()
        ? body.subcategory.trim()
        : null,
    description: typeof body.description === "string" ? body.description : "",
    base_price_text:
      explicitLabel ?? formatPriceLabel(getStartingPrice(price, pricingRules ?? {})),
    image_url:
      typeof body.image_url === "string" && body.image_url.trim()
        ? body.image_url.trim()
        : null,
    options_schema: optionsSchema,
    active: typeof body.active === "boolean" ? body.active : true,
    sort_order: toInt(body.sort_order),
    featured_rank: toInt(body.featured_rank),
    variant_images:
      body.variant_images && typeof body.variant_images === "object"
        ? body.variant_images
        : {},
    print_specs:
      body.print_specs && typeof body.print_specs === "object" ? body.print_specs : {},
    price,
    pricing_rules: pricingRules,
  };

  const { data, error } = await service
    .from("products")
    .insert(insertRow)
    .select(RETURN_COLS)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ...data,
    price: data.price != null ? Number(data.price) : null,
    pricing_rules: normalizePricingRules(data.pricing_rules),
  });
}
