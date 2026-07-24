export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";

export type PaymentStatus = "unpaid" | "pending" | "paid" | "refunded";

export type ProductCategory =
  | "Apparel"
  | "Print Materials"
  | "Promotional Products"
  | "DTF Printing"
  | "Marketing Services";

export interface OptionField {
  name: string;
  label: string;
  type: "select" | "radio" | "text" | "textarea";
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

export interface OptionsSchema {
  fields: OptionField[];
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  category: ProductCategory;
  description: string;
  base_price_text: string;
  price: number;
  image_url: string | null;
  options_schema: OptionsSchema;
  active: boolean;
  created_at: string;
}

export interface CartItem {
  id: string;
  product_slug: string;
  product_title: string;
  category: string;
  selected_options: Record<string, string>;
  unit_price: number;
  quantity: number;
  line_total: number;
  image_url?: string | null;
  artwork_files?: { name: string; url: string }[];
}

export interface Order {
  id: string;
  order_number: string | null;
  customer_name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  product_name: string;
  category: string;
  selected_options: Record<string, string>;
  cart_items: CartItem[];
  notes: string | null;
  file_urls: string[];
  status: OrderStatus;
  internal_notes: string | null;
  total_amount: number | null;
  payment_status: PaymentStatus;
  stripe_session_id: string | null;
  user_id: string | null;
  created_at: string;
}

/** @deprecated use Order */
export type QuoteRequest = Order & {
  quote_amount?: number | null;
  quote_message?: string | null;
  proof_status?: string;
  stripe_payment_link?: string | null;
  proof_file_url?: string | null;
  access_token?: string | null;
};

export type QuoteStatus = OrderStatus;
