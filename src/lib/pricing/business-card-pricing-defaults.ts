import {
  BUSINESS_CARD_QUANTITY_OPTIONS,
  CUSTOM_ORDER_QUANTITY,
} from "@/lib/pricing/business-card-quantities";
import type { OptionsSchema, ProductPricingRules } from "@/lib/types";
import { isOptionPricingSlug } from "@/lib/pricing/admin-pricing-catalog";

/** Relative scale vs 500-card anchor for starter quantity prices. */
const TIER_SCALE: Record<string, number> = {
  "250": 0.85,
  "500": 1,
  "1,000": 1.35,
  "2,500": 2,
  "5,000": 2.8,
  "10,000": 4,
  [CUSTOM_ORDER_QUANTITY]: 0,
};

export { BUSINESS_CARD_QUANTITY_OPTIONS, CUSTOM_ORDER_QUANTITY };

export function isBusinessCardSlug(slug: string): boolean {
  return slug.startsWith("business-cards-");
}

/** Products with quantity-tier + per-option add-on pricing. */
export function usesOptionPricing(
  slug?: string,
  category?: string,
  optionsSchema?: OptionsSchema
): boolean {
  if (!slug || !optionsSchema?.fields.some((f) => f.name === "quantity")) {
    return false;
  }
  return isOptionPricingSlug(slug);
}

export function usesBusinessCardPricing(
  category?: string,
  optionsSchema?: OptionsSchema
): boolean {
  return (
    category === "Business Cards" &&
    Boolean(optionsSchema?.fields.some((f) => f.name === "quantity"))
  );
}

export function pricedOptionFields(optionsSchema: OptionsSchema) {
  return optionsSchema.fields.filter(
    (f) =>
      f.name !== "need_design_help" &&
      (f.type === "select" || f.type === "radio") &&
      f.options?.length
  );
}

function defaultQuantityPrices(
  basePrice: number,
  optionsSchema?: OptionsSchema
): Record<string, number> {
  const qtyField = optionsSchema?.fields.find((f) => f.name === "quantity");
  const quantities = qtyField?.options ?? [];
  if (!quantities.length) return {};

  const anchor =
    quantities.find((q) => q === "500") ??
    quantities.find((q) => q === "250") ??
    quantities.find((q) => q !== CUSTOM_ORDER_QUANTITY) ??
    "500";

  const anchorScale = TIER_SCALE[anchor] ?? 1;
  const prices: Record<string, number> = {};

  for (const qty of quantities) {
    if (qty === CUSTOM_ORDER_QUANTITY) {
      prices[qty] = 0;
      continue;
    }
    const scale = (TIER_SCALE[qty] ?? 1) / anchorScale;
    prices[qty] = Math.round(basePrice * scale * 100) / 100;
  }

  return prices;
}

/** Merge saved rules + defaults into one option_prices map for admin & storefront. */
export function resolveOptionPrices(
  basePrice: number,
  optionsSchema: OptionsSchema,
  savedRules: ProductPricingRules | null | undefined
): Record<string, Record<string, number>> {
  const saved = savedRules?.option_prices ?? {};
  const result: Record<string, Record<string, number>> = {};

  for (const field of pricedOptionFields(optionsSchema)) {
    result[field.name] = {};
    for (const opt of field.options!) {
      const fromSaved = saved[field.name]?.[opt];
      if (fromSaved != null) {
        result[field.name][opt] = Number(fromSaved);
      } else if (field.name === "quantity") {
        const qtyDefaults = defaultQuantityPrices(basePrice, optionsSchema);
        result[field.name][opt] = qtyDefaults[opt] ?? basePrice;
      } else {
        result[field.name][opt] = 0;
      }
    }
  }

  return result;
}

export function getLowestQuantityPrice(
  optionPrices: Record<string, Record<string, number>>
): number | null {
  const qtyPrices = Object.values(optionPrices.quantity ?? {}).filter(
    (price) => price > 0
  );
  if (!qtyPrices.length) return null;
  return Math.min(...qtyPrices);
}
