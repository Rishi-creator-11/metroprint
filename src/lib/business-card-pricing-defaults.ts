import type { OptionsSchema, ProductPricingRules } from "@/lib/types";

/** Relative scale vs anchor quantity for starter quantity prices. */
const TIER_SCALE: Record<string, number> = {
  "25": 0.45,
  "50": 0.55,
  "100": 0.7,
  "250": 0.85,
  "500": 1,
  "1000": 1.35,
  "2500": 2,
  "5000": 2.8,
};

export function isBusinessCardSlug(slug: string): boolean {
  return slug.startsWith("business-cards-");
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
    quantities.find((q) => q === "100") ??
    quantities.find((q) => q === "250") ??
    quantities[0];

  const anchorScale = TIER_SCALE[anchor] ?? 1;
  const prices: Record<string, number> = {};

  for (const qty of quantities) {
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
  const qtyPrices = Object.values(optionPrices.quantity ?? {});
  if (!qtyPrices.length) return null;
  return Math.min(...qtyPrices);
}
