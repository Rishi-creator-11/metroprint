import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { fulfillPaidCheckoutSession } from "@/lib/fulfill-order";

export async function POST(request: Request) {
  try {
    const { session_id } = await request.json();

    if (!session_id) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    const sessionEmail = session.customer_email || session.customer_details?.email;
    if (
      sessionEmail &&
      user.email &&
      sessionEmail.toLowerCase() !== user.email.toLowerCase()
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const service = await createServiceClient();
    const result = await fulfillPaidCheckoutSession(service, session);

    if (!result) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order_number: result.order_number,
      order_id: result.id,
    });
  } catch (err) {
    console.error("Complete checkout error:", err);
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
  }
}
