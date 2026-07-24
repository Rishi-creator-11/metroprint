import type { Order, CartItem } from "./types";

function parseCartItems(value: unknown): CartItem[] {
  if (Array.isArray(value)) return value as CartItem[];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function normalizeOrder(raw: Record<string, unknown>): Order {
  const cartItems = parseCartItems(raw.cart_items);
  const selectedOptions =
    (raw.selected_options as Record<string, string>) ||
    (cartItems.length === 1 ? cartItems[0].selected_options : {}) ||
    {};

  return {
    id: raw.id as string,
    order_number: (raw.order_number as string) || null,
    customer_name: raw.customer_name as string,
    email: raw.email as string,
    phone: (raw.phone as string) || null,
    company_name: (raw.company_name as string) || null,
    product_name: raw.product_name as string,
    category: raw.category as string,
    selected_options: selectedOptions,
    cart_items: cartItems,
    notes: (raw.notes as string) || null,
    file_urls: (raw.file_urls as string[]) || [],
    status: (raw.status as Order["status"]) || "pending",
    internal_notes: (raw.internal_notes as string) || null,
    total_amount: raw.total_amount != null ? Number(raw.total_amount) : null,
    payment_status: (raw.payment_status as Order["payment_status"]) || "unpaid",
    stripe_session_id: (raw.stripe_session_id as string) || null,
    user_id: (raw.user_id as string) || null,
    created_at: raw.created_at as string,
  };
}

/** @deprecated */
export const normalizeQuoteRequest = normalizeOrder;
