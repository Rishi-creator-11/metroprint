import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import { unchunkFromStripeMetadata } from "@/lib/stripe-metadata";
import { collectArtworkUrls } from "@/lib/artwork";
import {
  sendAdminOrderNotification,
  sendOrderConfirmationEmail,
} from "@/lib/email";
import type { CartItem } from "@/lib/types";

export async function fulfillPaidCheckoutSession(
  supabase: SupabaseClient,
  session: Stripe.Checkout.Session
): Promise<{ order_number: string; id: string } | null> {
  if (session.payment_status !== "paid") return null;

  const metadata = session.metadata || {};
  const orderId = metadata.order_id;

  const { data: bySession } = await supabase
    .from("quote_requests")
    .select("order_number, id, payment_status, email, customer_name, total_amount")
    .eq("stripe_session_id", session.id)
    .maybeSingle();

  if (bySession?.payment_status === "paid") {
    return { order_number: bySession.order_number, id: bySession.id };
  }

  if (orderId) {
    const { data: pendingOrder } = await supabase
      .from("quote_requests")
      .select("order_number, id, payment_status, email, customer_name, total_amount")
      .eq("id", orderId)
      .maybeSingle();

    if (pendingOrder?.payment_status === "paid") {
      return { order_number: pendingOrder.order_number, id: pendingOrder.id };
    }

    const { data, error } = await supabase
      .from("quote_requests")
      .update({
        payment_status: "paid",
        status: "processing",
        stripe_session_id: session.id,
      })
      .eq("id", orderId)
      .select("order_number, id, email, customer_name, total_amount")
      .single();

    if (!error && data) {
      await notifyOrderPaid(data);
      return { order_number: data.order_number, id: data.id };
    }
  }

  // Legacy fallback for sessions created before pending-order checkout
  const cartJson = unchunkFromStripeMetadata(metadata, "cart_json");
  if (!cartJson || !metadata.order_number) return null;

  let cartItems: CartItem[];
  try {
    cartItems = JSON.parse(cartJson) as CartItem[];
  } catch {
    return null;
  }

  const fileUrlsMeta = unchunkFromStripeMetadata(metadata, "file_urls_json");
  let fileUrls = collectArtworkUrls(cartItems);
  if (fileUrlsMeta) {
    try {
      const parsed = JSON.parse(fileUrlsMeta) as string[];
      fileUrls = [...new Set([...fileUrls, ...parsed])];
    } catch {
      // ignore
    }
  }

  if (fileUrls.length > 0 && !cartItems.some((item) => item.artwork_files?.length)) {
    cartItems = cartItems.map((item, index) => {
      if (cartItems.length === 1 || index === 0) {
        return {
          ...item,
          artwork_files: fileUrls.map((url) => ({
            name: decodeURIComponent(url.split("/").pop() || "Artwork"),
            url,
          })),
        };
      }
      return item;
    });
  }

  const totalAmount =
    session.amount_total != null
      ? session.amount_total / 100
      : parseFloat(metadata.total_amount || "0");

  const customerName =
    metadata.customer_name ||
    session.customer_details?.name ||
    session.customer_email?.split("@")[0] ||
    "Customer";

  const { data, error } = await supabase
    .from("quote_requests")
    .insert({
      order_number: metadata.order_number,
      customer_name: customerName,
      email: session.customer_email || session.customer_details?.email || "",
      phone: metadata.phone || session.customer_details?.phone || null,
      company_name: metadata.company || null,
      product_name:
        cartItems.length === 1
          ? cartItems[0].product_title
          : `Order (${cartItems.length} items)`,
      category: cartItems.length === 1 ? cartItems[0].category : "Multiple",
      selected_options:
        cartItems.length === 1 ? cartItems[0].selected_options || {} : {},
      cart_items: cartItems,
      notes: metadata.notes || null,
      file_urls: fileUrls,
      status: "processing",
      payment_status: "paid",
      total_amount: totalAmount,
      stripe_session_id: session.id,
      user_id: metadata.user_id || null,
    })
    .select("order_number, id, email, customer_name, total_amount")
    .single();

  if (error || !data) return null;

  await notifyOrderPaid(data);
  return { order_number: data.order_number, id: data.id };
}

async function notifyOrderPaid(order: {
  order_number: string;
  email: string;
  customer_name: string;
  total_amount: number | null;
}) {
  await Promise.allSettled([
    sendOrderConfirmationEmail({
      to: order.email,
      customerName: order.customer_name,
      orderNumber: order.order_number,
      totalAmount: order.total_amount,
    }),
    sendAdminOrderNotification({
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerEmail: order.email,
      totalAmount: order.total_amount,
    }),
  ]);
}

export { notifyOrderPaid };
