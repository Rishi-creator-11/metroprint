import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { createCheckoutSession } from "@/lib/stripe-checkout";
import { generateOrderNumber } from "@/lib/order-utils";
import { collectArtworkUrls } from "@/lib/artwork";
import {
  getProductPrice,
  getCartLineTotal,
  parseQuantityFromOptions,
} from "@/lib/product-prices";
import type { CartItem } from "@/lib/types";

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

    const service = await createServiceClient();

    const slugs = [...new Set(items.map((item) => item.product_slug))];
    const { data: dbProducts } = await service
      .from("products")
      .select("slug, price")
      .in("slug", slugs);

    const priceBySlug: Record<string, number | null> = {};
    for (const row of dbProducts || []) {
      priceBySlug[row.slug] =
        row.price != null ? Number(row.price) : null;
    }

    const validatedItems = items.map((item) => {
      const dbPrice = priceBySlug[item.product_slug];
      const unitPrice = getProductPrice(item.product_slug, dbPrice);
      const quantity = parseQuantityFromOptions(item.selected_options);
      const lineTotal = getCartLineTotal(unitPrice, quantity);
      return {
        ...item,
        unit_price: unitPrice,
        quantity,
        line_total: lineTotal,
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
        file_urls: collectArtworkUrls(validatedItems),
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
        unitAmountCents: Math.round(item.unit_price * 100),
        quantity: item.quantity,
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
