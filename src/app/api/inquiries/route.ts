import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { generateOrderNumber } from "@/lib/order-utils";
import { sendInquiryNotification } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { name, email, phone, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createServiceClient();

    const { error } = await supabase.from("quote_requests").insert({
      order_number: generateOrderNumber(),
      customer_name: name,
      email,
      phone: phone || null,
      product_name: "Custom Quote Inquiry",
      category: "Inquiry",
      selected_options: {},
      cart_items: [],
      notes: message,
      file_urls: [],
      status: "pending",
      payment_status: "unpaid",
    });

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Failed to save inquiry" }, { status: 500 });
    }

    await sendInquiryNotification({ name, email, phone, message });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
