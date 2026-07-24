/** Default unit prices (USD) — update anytime in admin/DB later */
export const PRODUCT_PRICES: Record<string, number> = {
  "custom-t-shirt-printing": 18.99,
  "custom-polo-printing": 24.99,
  "custom-hoodie-printing": 34.99,
  "custom-hats": 14.99,
  "tote-bags": 12.99,
  "business-cards": 29.99,
  flyers: 49.99,
  brochures: 89.99,
  posters: 19.99,
  "door-hangers": 59.99,
  bookmarks: 39.99,
  folders: 99.99,
  "roll-up-banners": 89.99,
  "custom-mugs": 11.99,
  "custom-tumblers": 16.99,
  "branded-merchandise": 149.99,
  "dtf-transfers": 24.99,
  "custom-apparel-printing-dtf": 22.99,
  "graphic-design-services": 75.0,
  branding: 499.0,
  "social-media-management": 299.0,
  "video-production": 999.0,
  "content-creation": 50.0,
};

export function getProductPrice(slug: string, dbPrice?: number | null): number {
  if (dbPrice != null && dbPrice > 0) return Number(dbPrice);
  return PRODUCT_PRICES[slug] ?? 29.99;
}

export function formatPriceLabel(amount: number): string {
  return `Starting at ${formatPrice(amount)}`;
}

export function withProductPrice<T extends { slug: string; price?: number | null }>(
  product: T
): T & { price: number } {
  return {
    ...product,
    price: getProductPrice(product.slug, product.price),
  };
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function getCartLineTotal(unitPrice: number, quantity: number): number {
  return Math.round(unitPrice * quantity * 100) / 100;
}

export function parseQuantityFromOptions(
  options: Record<string, string>
): number {
  const raw = options.quantity;
  if (!raw) return 1;
  const n = parseInt(raw.replace(/\D/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}
