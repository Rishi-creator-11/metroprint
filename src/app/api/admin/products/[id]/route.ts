import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/auth";
import { formatPriceLabel, getProductPrice } from "@/lib/product-prices";
import {
  getStartingPrice,
  normalizePricingRules,
} from "@/lib/pricing";
import type { ProductPricingRules } from "@/lib/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = await createServiceClient();
  const { data: adminUser } = await service.auth.admin.getUserById(user.id);
  if (!isAdminUser(adminUser?.user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};

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

  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: "No updates" }, { status: 400 });
  }

  if (basePrice !== undefined || pricingRules) {
    const { data: existing } = await service
      .from("products")
      .select("slug, price")
      .eq("id", id)
      .single();

    const slug = existing?.slug ?? "";
    const resolvedBase =
      basePrice ??
      getProductPrice(slug, existing?.price != null ? Number(existing.price) : null);
    const resolvedRules =
      pricingRules ?? normalizePricingRules(body.pricing_rules) ?? {};

    const displayPrice = getStartingPrice(resolvedBase, resolvedRules);
    updates.base_price_text = formatPriceLabel(displayPrice);
  }

  const { data, error } = await service
    .from("products")
    .update(updates)
    .eq("id", id)
    .select(
      "id, title, slug, category, price, base_price_text, active, pricing_rules"
    )
    .single();

  if (error) {
    const missingColumn = error.message?.includes("pricing_rules");
    return NextResponse.json(
      {
        error: missingColumn
          ? "Run supabase/migrations/016_product_pricing_rules.sql in Supabase first."
          : error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ...data,
    price: data.price != null ? Number(data.price) : null,
    pricing_rules: normalizePricingRules(data.pricing_rules),
  });
}
