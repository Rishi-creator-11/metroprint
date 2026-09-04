import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { createCheckoutSession } from "@/lib/checkout/stripe-checkout";
import { generateOrderNumber } from "@/lib/checkout/order-utils";
import { collectArtworkUrls } from "@/lib/checkout/artwork";
import {
  getProductPrice,
} from "@/lib/products/product-prices";
import { calculateLinePrice, normalizePricingRules } from "@/lib/pricing/pricing";
import { getSeedProductBySlug } from "@/lib/products/products-data";
import type { CartItem, OptionsSchema } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Please sign in to checkout" }, { status: 401 });
    }

    const { items, notes } = (await request.json()) as {
      items: CartItem[];
      notes?: string;
    };

    if (!items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const hasCustomOrder = items.some((item) =>
      item.selected_options?.quantity?.trim() === "Custom order"
    );
    if (hasCustomOrder) {
      return NextResponse.json(
        {
          error:
            "Custom quantity orders require a quote. Remove them from your cart or request a quote instead.",
        },
        { status: 400 }
      );
    }

    const service = await createServiceClient();

    const slugs = [...new Set(items.map((item) => item.product_slug))];
    const { data: initialDbProducts, error: productsError } = await service
      .from("products")
      .select("slug, price, pricing_rules, category, options_schema")
      .in("slug", slugs);
    let dbProducts = initialDbProducts;

    if (productsError?.message?.includes("pricing_rules")) {
      const fallback = await service
        .from("products")
        .select("slug, price, category, options_schema")
        .in("slug", slugs);
      dbProducts =
        fallback.data?.map((row) => ({ ...row, pricing_rules: null })) ?? null;
    }

    const dbRowBySlug = new Map(
      (dbProducts || []).map((row) => [row.slug, row])
    );

    const productBySlug: Record<
      string,
      {
        price: number | null;
        pricing_rules: ReturnType<typeof normalizePricingRules>;
        category: string;
        options_schema: OptionsSchema;
      }
    > = {};

    // Resolve every requested slug — from the DB row if it exists, otherwise from
    // the seed definition. Without the seed fallback a Large Format / seed-only
    // product would have no options_schema here and calculateLinePrice would
    // charge `price × quantity` instead of the (synthesized) quantity tier.
    for (const slug of slugs) {
      const row = dbRowBySlug.get(slug);
      const seed = getSeedProductBySlug(slug);
      if (!row && !seed) continue;

      // DB schema is authoritative when it has fields; otherwise fall back to
      // the seed (covers products with no DB row and legacy empty schemas).
      const dbSchema = row?.options_schema as OptionsSchema | undefined;
      const options_schema = (
        dbSchema?.fields?.length ? dbSchema : seed?.options_schema ?? { fields: [] }
      ) as OptionsSchema;

      productBySlug[slug] = {
        price: row?.price != null ? Number(row.price) : null,
        pricing_rules: normalizePricingRules(
          row && "pricing_rules" in row ? row.pricing_rules : null
        ),
        category: row?.category ?? seed?.category ?? "",
        options_schema,
      };
    }

    const validatedItems = items.map((item) => {
      const db = productBySlug[item.product_slug];
      const basePrice = getProductPrice(item.product_slug, db?.price);
      const result = calculateLinePrice(
        basePrice,
        db?.pricing_rules,
        item.selected_options || {},
        {
          slug: item.product_slug,
          category: db?.category ?? item.category,
          optionsSchema: db?.options_schema,
        }
      );
      return {
        ...item,
        unit_price: result.unitPrice,
        quantity: result.orderQuantity,
        line_total: result.lineTotal,
        is_tier_pricing: result.isTierPricing,
      };
    });

    const total = validatedItems.reduce((s, i) => s + i.line_total, 0);
    const orderNumber = generateOrderNumber();
    const customerName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Customer";

    const { data: order, error: insertError } = await service
      .from("quote_requests")
      .insert({
        order_number: orderNumber,
        customer_name: customerName,
        email: user.email,
        phone: user.user_metadata?.phone || null,
        company_name: user.user_metadata?.company || null,
        product_name:
          validatedItems.length === 1
            ? validatedItems[0].product_title
            : `Order (${validatedItems.length} items)`,
        category:
          validatedItems.length === 1 ? validatedItems[0].category : "Multiple",
        selected_options:
          validatedItems.length === 1
            ? validatedItems[0].selected_options || {}
            : {},
        cart_items: validatedItems,
        notes: notes || null,
        file_urls: [
          ...collectArtworkUrls(validatedItems),
          ...validatedItems.flatMap((i) =>
            [i.design?.frontUrl, i.design?.backUrl].filter((u): u is string => !!u),
          ),
        ].filter((u, idx, arr) => arr.indexOf(u) === idx),
        status: "pending",
        payment_status: "pending",
        total_amount: total,
        user_id: user.id,
      })
      .select("id")
      .single();

    if (insertError || !order) {
      console.error("Checkout order insert error:", insertError);
      return NextResponse.json(
        {
          error:
            insertError?.code === "PGRST204"
              ? "Database migration required. Run supabase/migrations/003_checkout.sql in Supabase."
              : "Could not create order",
        },
        { status: 500 }
      );
    }

    const session = await createCheckoutSession({
      customerEmail: user.email!,
      userId: user.id,
      orderNumber,
      items: validatedItems.map((item) => ({
        title: item.product_title,
        unitAmountCents: Math.round(item.line_total * 100),
        quantity: 1,
      })),
      metadata: {
        order_id: order.id,
      },
    });

    await service
      .from("quote_requests")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Checkout failed. Is Stripe configured?",
      },
      { status: 500 }
    );
  }
}
