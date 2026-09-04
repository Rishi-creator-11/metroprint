export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";

export type PaymentStatus = "unpaid" | "pending" | "paid" | "refunded";

export type ProductCategory =
  | "Apparel"
  | "Business Cards"
  | "Print Materials"
  | "Large Format"
  | "Promotional Products"
  | "Marketing Services";

/** Runtime list of every valid product category (keep in sync with ProductCategory). */
export const PRODUCT_CATEGORIES: ProductCategory[] = [
  "Business Cards",
  "Print Materials",
  "Large Format",
  "Apparel",
  "Promotional Products",
  "Marketing Services",
];

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

/** Every option value has its own price (quantity = order total, others = add-on). */
export interface ProductPricingRules {
  option_prices?: Record<string, Record<string, number>>;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  category: ProductCategory;
  subcategory?: string | null;
  description: string;
  base_price_text: string;
  price: number;
  image_url: string | null;
  options_schema: OptionsSchema;
  pricing_rules?: ProductPricingRules | null;
  active: boolean;
  /** Within-category display order (nulls sort last). Admin-managed. */
  sort_order?: number | null;
  /** Homepage "Popular products" rank (null = not featured). Admin-managed. */
  featured_rank?: number | null;
  /** Per-option-value images (e.g. { "Navy": url }) — selecting the value swaps the main image. */
  variant_images?: Record<string, string> | null;
  /** Artwork-studio print spec override (admin-managed). `{}` = use code defaults. */
  print_specs?: Record<string, unknown> | null;
  created_at: string;
}

/** A storefront category. Managed in `categories` (DB) with the CATEGORIES constant as fallback. */
export interface Category {
  id: string;
  name: ProductCategory | string;
  slug: string;
  description: string;
  image_url: string | null;
  sort_order: number;
  visible: boolean;
  /** Optional dedicated route (e.g. Business Cards → /business-cards). */
  href?: string;
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
  is_tier_pricing?: boolean;
  image_url?: string | null;
  artwork_files?: { name: string; url: string }[];
  /** Compact reference to a studio design (thumbnail + artwork URLs). */
  design?: import("@/lib/studio/design").CartDesignRef;
  /** Full studio design state, for re-opening in the editor. */
  design_full?: import("@/lib/studio/design").StudioDesign;
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
