import { getStartingPrice as getStartingFromRules } from "@/lib/pricing/pricing";
import {
  getLowestQuantityPrice,
  resolveOptionPrices,
  usesOptionPricing,
} from "@/lib/pricing/business-card-pricing-defaults";
import type { OptionsSchema, ProductPricingRules } from "@/lib/types";
export const PRODUCT_PRICES: Record<string, number> = {
  "custom-t-shirt-printing": 18.99,
  "custom-long-sleeve-t-shirt-printing": 24.99,
  "custom-polo-printing": 24.99,
  "custom-hoodie-printing": 34.99,
  "custom-hats": 14.99,
  "tote-bags": 12.99,
  "business-cards-standard": 29.99,
  "business-cards-premium-metallic-foil-raised": 43.0,
  "business-cards-premium-kraft-paper": 11.61,
  "business-cards-premium-durable": 26.82,
  "business-cards-premium-spot-uv-raised": 43.93,
  "business-cards-premium-soft-touch-suede": 26.5,
  "business-cards-premium-32pt-painted-edge": 53.65,
  "business-cards-specialty-fold-over": 36.99,
  "business-cards-specialty-plastic": 34.99,
  "business-cards-specialty-magnetic": 39.99,
  flyers: 49.99,
  postcards: 39.99,
  brochures: 89.99,
  posters: 19.99,
  "door-hangers": 59.99,
  bookmarks: 39.99,
  folders: 99.99,
  "coroplast-signs": 19.99,
  "floor-graphics": 29.99,
  "foam-board": 24.99,
  "aluminum-signs": 49.99,
  banners: 39.99,
  "roll-up-banners": 89.99,
  "car-door-magnets": 49.99,
  "table-covers": 129.99,
  "adhesive-vinyl": 34.99,
  "window-graphics": 39.99,
  "large-format-posters": 29.99,
  "styrene-signs": 34.99,
  "display-board-pop": 44.99,
  "canvas-prints": 59.99,
  "sintra-pvc": 39.99,
  "x-frame-banners": 79.99,
  "a-frame-signs": 49.99,
  "wall-decals": 29.99,
  "a-frame-stands": 89.99,
  "h-stands": 12.99,
  "custom-mugs": 11.99,
  "custom-tumblers": 16.99,
  "branded-merchandise": 149.99,
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

export function withProductPrice<
  T extends {
    slug: string;
    price?: number | null;
    pricing_rules?: ProductPricingRules | null;
  },
>(product: T): T & { price: number } {
  return {
    ...product,
    price: getProductPrice(product.slug, product.price),
  };
}

export function getProductDisplayPrice(
  slug: string,
  dbPrice: number | null | undefined,
  pricingRules?: ProductPricingRules | null,
  context?: { category?: string; optionsSchema?: OptionsSchema }
): number {
  const base = getProductPrice(slug, dbPrice);
  if (usesOptionPricing(slug, context?.category, context?.optionsSchema)) {
    const rules = resolveOptionPrices(
      base,
      context!.optionsSchema!,
      pricingRules
    );
    const lowest = getLowestQuantityPrice(rules);
    return lowest ?? base;
  }
  return getStartingFromRules(base, pricingRules);
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
