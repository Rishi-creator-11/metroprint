import { getStripe } from "./stripe";

export async function createCheckoutSession(params: {
  items: {
    title: string;
    unitAmountCents: number;
    quantity: number;
  }[];
  customerEmail: string;
  userId: string;
  orderNumber: string;
  metadata: Record<string, string>;
}) {
  const stripe = getStripe();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: params.customerEmail,
    line_items: params.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.title,
        },
        unit_amount: item.unitAmountCents,
      },
      quantity: item.quantity,
    })),
    success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/cart`,
    metadata: {
      user_id: params.userId,
      order_number: params.orderNumber,
      ...params.metadata,
    },
  });

  return session;
}
