/**
 * Pricing regression fixtures.
 *
 * PURPOSE: freeze the CURRENT behaviour of `calculateLinePrice()` so the pricing
 * refactor (and ongoing feature work) can't silently move a line total.
 *
 * `LIVE_PRICE_SNAPSHOT` is a verbatim capture of `products.price` +
 * `products.pricing_rules` from the live Supabase project `tggerxbkxtnucmlrafqn`
 * on **2026-09-03**. Migration `035_large_format_products.sql` was NOT applied at
 * capture time, so `roll-up-banners` still carries its old `metal_stand` rules
 * while the seed schema already uses `banner_type` (see pricing.test.ts).
 *
 * DO NOT edit these values to "match" the code. Only update a slug here when a
 * deliberate price change is made in Supabase (and then update the expected
 * totals in pricing.test.ts in the same commit).
 */
import { getSeedProductBySlug } from "@/lib/products/products-data";
import { getProductPrice } from "@/lib/products/product-prices";
import { calculateLinePrice, normalizePricingRules } from "@/lib/pricing/pricing";
import type { LinePriceResult, PricingContext } from "@/lib/pricing/pricing";
import type { OptionsSchema } from "@/lib/types";

type PriceSnapshot = { price: number; pricing_rules: unknown };

export const LIVE_PRICE_SNAPSHOT: Record<string, PriceSnapshot> = {
  "business-cards-standard": {
    price: 29.99,
    pricing_rules: {
      option_prices: {
        quantity: { "250": 25.49, "500": 29.99, "1,000": 40.49, "2,500": 59.98, "5,000": 83.97, "10,000": 119.96, "Custom order": 0 },
        stock: { "14pt": 0, "16pt": 5, "18pt": 10 },
        finish: { Matte: 0, "UV Gloss": 8 },
        corners: { Rectangle: 0, Rounded: 3 },
        sides: { "Single Sided": 0, "Double Sided": 5 },
      },
    },
  },
  "business-cards-premium-metallic-foil-raised": {
    price: 43,
    pricing_rules: {
      option_prices: {
        quantity: { "250": 36.55, "500": 43, "1,000": 58.05, "2,500": 86, "5,000": 120.4, "10,000": 172, "Custom order": 0 },
        size: { '3.5" x 2"': 0 },
        sides: { "Single Sided": 0, "Double Sided": 6 },
        corners: { Rectangle: 0, Rounded: 3 },
        foil_color: {
          "Gold metallic foil (front)": 0,
          "Silver metallic foil (front)": 0,
          "Gold metallic foil (both sides)": 8,
          "Silver metallic foil (both sides)": 8,
        },
        lamination: { "Matte Lamination 2 Sided": 5, "Soft Touch Lamination 2 Sided": 8 },
      },
    },
  },
  "business-cards-premium-spot-uv-raised": {
    price: 43.93,
    pricing_rules: {
      option_prices: {
        quantity: { "250": 37.34, "500": 43.93, "1,000": 59.31, "2,500": 87.86, "5,000": 123, "10,000": 175.72, "Custom order": 0 },
        size: { '3.5" x 2"': 0 },
        sides: { "Single Sided": 0, "Double Sided": 6 },
        corners: { Rectangle: 0, Rounded: 3 },
        spot_uv: { "One sided": 0, "Both sides": 10 },
        lamination: { "Matte Lamination 2 Sided": 5, "Soft Touch Lamination 2 Sided": 8 },
      },
    },
  },
  "business-cards-premium-32pt-painted-edge": {
    price: 53.65,
    pricing_rules: {
      option_prices: {
        quantity: { "250": 61.57, "500": 72.43, "1,000": 97.78, "2,500": 144.86, "5,000": 202.8, "10,000": 289.72, "Custom order": 0 },
        size: { '3.5" x 2"': 0 },
        sides: { "Single Sided": 0, "Double Sided": 8 },
        paint_color: {
          Red: 0, Blue: 0, Pink: 0, Black: 0, Brown: 0, Orange: 0, Purple: 0, Yellow: 0, Turquoise: 0,
          "White (Not Painted)": 0,
          "Metallic Blue": 3, "Metallic Gold": 5, "Metallic Green": 3, "Metallic Orange": 3,
          "Metallic Purple": 3, "Metallic Yellow": 3, "Metallic Hot Pink": 3,
        },
      },
    },
  },
  "business-cards-specialty-plastic": {
    price: 19.57,
    pricing_rules: {
      option_prices: {
        quantity: { "250": 29.74, "500": 34.99, "1,000": 47.24, "2,500": 69.98, "5,000": 97.97, "10,000": 139.96, "Custom order": 0 },
        size: { '2" x 3.5"': 2 },
        shape: { Oval: 5, "Rounded 4 Corners": 10 },
        plastic_type: { "Clear Plastic": 5, "White Plastic": 2, "Frosted Plastic": 4 },
        colorspec: { "4/0 (4 color front)": 2, "4/4 (4 color both sides)": 10 },
      },
    },
  },
  "business-cards-specialty-magnetic": {
    price: 39.99,
    pricing_rules: {
      option_prices: {
        quantity: { "250": 33.99, "500": 39.99, "1,000": 53.99, "2,500": 79.98, "5,000": 111.97, "10,000": 159.96, "Custom order": 0 },
        size: { '2" x 3.5"': 0 },
        shape: { Oval: 5, Rectangle: 0, "Rounded 4 Corners": 0 },
        corner_radius: { '1/8"': 0, '3/16"': 2, '1/4"': 3, "N/A (Rectangle or Oval)": 0 },
      },
    },
  },
  "business-cards-specialty-fold-over": {
    price: 36.99,
    pricing_rules: {
      option_prices: {
        quantity: { "250": 31.44, "500": 36.99, "1,000": 49.94, "2,500": 73.98, "5,000": 103.57, "10,000": 147.96, "Custom order": 0 },
        size: { '2" x 7"': 0, '3.5" x 4"': 5 },
        finish: { Matte: 0, "UV Gloss": 8, "Soft Touch": 12 },
      },
    },
  },
  postcards: {
    price: 39.99,
    pricing_rules: {
      option_prices: {
        quantity: { "250": 33.99, "500": 39.99, "1,000": 53.99, "2,500": 79.98, "5,000": 111.97, "10,000": 159.96, "Custom order": 0 },
        size: { '4" x 4"': 0, '4" x 6"': 0, '4" x 9"': 0, '5" x 7"': 0, '5" x 8"': 0, '6" x 6"': 0, '6" x 9"': 0, '6" x 11"': 0, '5.5" x 8.5"': 0, '3.67" x 8.5"': 0 },
        sides: { "Single Sided": 0, "Double Sided": 5 },
        stock: { "14pt C2S": 0, "16pt C2S": 3 },
        need_design_help: { No: 0, Yes: 0 },
      },
    },
  },
  brochures: {
    price: 89.99,
    pricing_rules: {
      option_prices: {
        quantity: { "250": 89.99, "500": 105.87, "1,000": 142.93, "2,500": 211.74, "5,000": 296.44, "10,000": 423.48, "Custom order": 0 },
        size: { '9" x 12"': 0, '11" x 17"': 0, '17" x 22"': 0, '8.5" x 11"': 0, '8.5" x 14"': 0, '11" x 25.5"': 0 },
        sides: { "Single Sided": 0, "Double Sided": 5 },
        fold_type: { "Z Fold": 0, "Half Fold": 0, "4 Panel Accordion Fold": 0 },
      },
    },
  },
  bookmarks: {
    price: 39.99,
    pricing_rules: {
      option_prices: {
        quantity: { "250": 33.99, "500": 39.99, "1,000": 53.99, "2,500": 79.98, "5,000": 111.97, "10,000": 159.96, "Custom order": 0 },
        size: { '2" x 7"': 0, '2" x 8"': 0, '3" x 4"': 0, '1.5" x 7"': 0, '2.5" x 8.5"': 0, '3.5" x 8.5"': 0, '2.75" x 8.5"': 0, '8.5" x 3.66"': 0, '3.66" x 4.25"': 0 },
        sides: { "Single Sided": 0, "Double Sided": 5 },
        stock: { "14pt C2S": 0, "16pt C2S": 3 },
      },
    },
  },
  "door-hangers": {
    price: 59.99,
    pricing_rules: {
      option_prices: {
        quantity: { "250": 50.99, "500": 59.99, "1,000": 80.99, "2,500": 119.98, "5,000": 167.97, "10,000": 239.96, "Custom order": 0 },
        size: { '4.25" x 11"': 0, '8.5" x 3.5"': 0 },
        sides: { "Single Sided": 0, "Double Sided": 5 },
        stock: { "14pt C2S": 0, "16pt C2S": 3 },
      },
    },
  },
  folders: {
    price: 99.99,
    pricing_rules: {
      option_prices: {
        quantity: { "250": 99.99, "500": 117.64, "1,000": 158.81, "2,500": 235.27, "5,000": 329.38, "10,000": 470.54, "Custom order": 0 },
        size: { '6" x 9"': 0, '5.25" x 10.5"': 0, '9" x 12" - 3 inch Pocket': 0, '9" x 12" - 4 inch Pocket': 0, '9" x 14.5" - 3 inch Pocket': 0, '9" x 14.5" - 4 inch Pocket': 0 },
        pockets: { No: 0, Yes: 0 },
        business_card_slit: { None: 0, "Left Side": 0, "Both Sides": 0, "Right Side": 0 },
      },
    },
  },
  posters: {
    price: 19.99,
    pricing_rules: {
      option_prices: {
        quantity: { "250": 15, "500": 17.65, "1,000": 23.82, "2,500": 35.29, "5,000": 49.41, "10,000": 70.59, "Custom order": 0 },
        size: { '11" x 17"': 0, '18" x 24"': 0, '24" x 36"': 0 },
        paper_type: { Matte: 0, Satin: 0, Glossy: 0 },
      },
    },
  },
  // NOTE: seed schema for roll-up-banners now uses `banner_type` (Large Format
  // rework) but the LIVE pricing_rules still carry the old `metal_stand` map
  // because migration 035 is not applied. This snapshot captures that exact
  // mismatch state. See pricing.test.ts "roll-up-banners (schema / DB drift)".
  "roll-up-banners": {
    price: 89.99,
    pricing_rules: {
      option_prices: {
        quantity: { "250": 89, "500": 104.71, "1,000": 141.35, "2,500": 209.41, "5,000": 293.18, "10,000": 418.82, "Custom order": 0 },
        size: { '33" x 81"': 0 },
        metal_stand: { Premium: 0, Standard: 0 },
      },
    },
  },
  "car-door-magnets": {
    price: 49.99,
    pricing_rules: {
      option_prices: {
        quantity: { "250": 49.99, "500": 58.81, "1,000": 79.4, "2,500": 117.62, "5,000": 164.67, "10,000": 235.25, "Custom order": 0 },
        size: { '12" x 18"': 0, '12" x 24"': 20, '18" x 24"': 0, '18" x 30"': 0, '24" x 24"': 0, '24" x 36"': 0 },
        rounded_corners: { No: 0, Yes: 0 },
      },
    },
  },
  // Flyers: pricing_rules is literally `{}` in the DB. All flyer prices are
  // SYNTHESIZED from `price` x TIER_SCALE at runtime. Frozen deliberately.
  flyers: { price: 49.99, pricing_rules: {} },
  "custom-t-shirt-printing": {
    price: 18.99,
    pricing_rules: {
      option_prices: {
        quantity: { "1": 18.99, "6": 113.94, "12": 227.88, "48": 911.52, "96": 1823.04 },
        material: { Cotton: 0, Polyester: 0 },
        shirt_color: { Red: 0, Navy: 0, Pink: 0, Beige: 0, Black: 0, Brown: 0, Cream: 0, Green: 0, White: 0, Maroon: 0, Orange: 0, Purple: 0, Yellow: 0, Charcoal: 0, "Light Blue": 0, "Royal Blue": 0, "Forest Green": 0, "Heather Gray": 0 },
        print_location: { Back: 0, Front: 0, "Front and Back": 0 },
      },
    },
  },
  "custom-hoodie-printing": {
    price: 34.99,
    pricing_rules: {
      option_prices: {
        quantity: { "1": 34.99, "6": 209.94, "12": 419.88, "48": 1679.52, "96": 3359.04 },
        hoodie_color: { Red: 0, Navy: 0, Pink: 0, Beige: 0, Black: 0, Brown: 0, Cream: 0, Green: 0, White: 0, Maroon: 0, Orange: 0, Purple: 0, Yellow: 0, Charcoal: 0, "Light Blue": 0, "Royal Blue": 0, "Forest Green": 0, "Heather Gray": 0 },
        print_location: { Back: 0, Front: 0, "Front and Back": 0 },
      },
    },
  },
  // Custom Hats: price is $1.00 and every quantity tier equals the unit count.
  // Almost certainly a placeholder/test value. FROZEN, not fixed — see
  // docs/PRICING_ARCHITECTURE.md "Known Pricing Behaviors / Review Items".
  "custom-hats": {
    price: 1,
    pricing_rules: {
      option_prices: {
        quantity: { "1": 1, "6": 6, "12": 12, "48": 48, "96": 96 },
        hat_style: { "Trucker Hat": 0, "Baseball Cap": 0 },
        hat_color: { Red: 0, Navy: 0, Pink: 0, Beige: 0, Black: 0, Brown: 0, Cream: 0, Green: 0, White: 0, Maroon: 0, Orange: 0, Purple: 0, Yellow: 0, Charcoal: 0, "Light Blue": 0, "Royal Blue": 0, "Forest Green": 0, "Heather Gray": 0 },
      },
    },
  },
  // custom-mugs: NOT an option-priced slug (absent from ADMIN_PRICING_SECTIONS).
  // pricing_rules is `{}`. Flat `price x quantity` path.
  "custom-mugs": { price: 11.99, pricing_rules: {} },
};

/**
 * Mirrors the per-line calculation in `POST /api/checkout` (see
 * src/app/api/checkout/route.ts):
 *   basePrice  = getProductPrice(slug, db.price)
 *   rules      = normalizePricingRules(db.pricing_rules)
 *   schema     = seed options_schema for option-priced slugs
 *   result     = calculateLinePrice(basePrice, rules, selectedOptions, ctx)
 */
export function calcLine(
  slug: string,
  selectedOptions: Record<string, string>,
): LinePriceResult {
  const seed = getSeedProductBySlug(slug);
  const snap = LIVE_PRICE_SNAPSHOT[slug];
  const basePrice = getProductPrice(slug, snap?.price ?? null);
  const rules = normalizePricingRules(snap?.pricing_rules ?? null);
  const optionsSchema: OptionsSchema = seed?.options_schema ?? { fields: [] };

  return calculateLinePrice(basePrice, rules, selectedOptions, {
    slug,
    category: seed?.category,
    optionsSchema,
  });
}

/**
 * Lower-level helper for precedence / synthetic-rule tests where we want to
 * control basePrice, raw rules and schema directly.
 */
export function calcLineRaw(
  basePrice: number,
  rawRules: unknown,
  selectedOptions: Record<string, string>,
  context: PricingContext,
): LinePriceResult {
  return calculateLinePrice(
    basePrice,
    normalizePricingRules(rawRules),
    selectedOptions,
    context,
  );
}

/** The seed options_schema the storefront/checkout actually use for a slug. */
export function seedSchema(slug: string): OptionsSchema {
  return getSeedProductBySlug(slug)?.options_schema ?? { fields: [] };
}
