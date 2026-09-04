import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/admin-server";
import { formatPriceLabel, getProductPrice } from "@/lib/products/product-prices";
import { getStartingPrice, normalizePricingRules } from "@/lib/pricing/pricing";
import { getSeedProductBySlug } from "@/lib/products/products-data";
import type { ProductPricingRules } from "@/lib/types";

function buildPricingUpdates(
  slug: string,
  body: { price?: number; pricing_rules?: unknown; base_price_text?: unknown },
  existingPrice: number | null
) {
  const updates: Record<string, unknown> = {};
  let basePrice: number | undefined;
  let pricingRules: ProductPricingRules | undefined;

  if (body.price !== undefined) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price <= 0) {
      return { error: NextResponse.json({ error: "Invalid price" }, { status: 400 }) };
    }
    basePrice = price;
    updates.price = price;
  }

  if (body.pricing_rules !== undefined) {
    pricingRules = normalizePricingRules(body.pricing_rules) ?? undefined;
    if (pricingRules) updates.pricing_rules = pricingRules;
  }

  if (!Object.keys(updates).length) {
    return { error: NextResponse.json({ error: "No updates" }, { status: 400 }) };
  }

  const resolvedBase =
    basePrice ?? getProductPrice(slug, existingPrice != null ? Number(existingPrice) : null);
  const resolvedRules = pricingRules ?? normalizePricingRules(body.pricing_rules) ?? {};

  const explicitLabel =
    typeof body.base_price_text === "string" && body.base_price_text.trim()
      ? body.base_price_text.trim()
      : undefined;
  updates.base_price_text =
    explicitLabel ?? formatPriceLabel(getStartingPrice(resolvedBase, resolvedRules));

  return { updates, pricingRules: resolvedRules, basePrice: resolvedBase };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;
  const { service } = auth;

  const seed = getSeedProductBySlug(slug);
  if (!seed) {
    return NextResponse.json({ error: "Unknown product slug" }, { status: 404 });
  }

  const body = await request.json();
  const { data: existing } = await service
    .from("products")
    .select("id, price")
    .eq("slug", slug)
    .maybeSingle();

  const pricing = buildPricingUpdates(slug, body, existing?.price ?? null);
  if ("error" in pricing && pricing.error) return pricing.error;

  if (existing) {
    const { data, error } = await service
      .from("products")
      .update(pricing.updates)
      .eq("id", existing.id)
      .select(
        "id, title, slug, category, price, base_price_text, active, pricing_rules"
      )
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

  const insertRow = {
    title: seed.title,
    slug: seed.slug,
    category: seed.category,
    description: seed.description,
    base_price_text: pricing.updates.base_price_text as string,
    image_url: seed.image_url,
    options_schema: seed.options_schema,
    active: true,
    price: pricing.basePrice ?? getProductPrice(slug, null),
    pricing_rules: pricing.updates.pricing_rules ?? null,
  };

  const { data, error } = await service
    .from("products")
    .insert(insertRow)
    .select(
      "id, title, slug, category, price, base_price_text, active, pricing_rules"
    )
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
