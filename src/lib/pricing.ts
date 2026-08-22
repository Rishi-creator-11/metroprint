import {
  getCartLineTotal,
  parseQuantityFromOptions,
} from "@/lib/product-prices";
import {
  getLowestQuantityPrice,
  resolveOptionPrices,
  usesBusinessCardPricing,
} from "@/lib/business-card-pricing-defaults";
import type { OptionsSchema, ProductPricingRules } from "@/lib/types";

export interface PricingContext {
  slug?: string;
  category?: string;
  optionsSchema?: OptionsSchema;
}

export interface LinePriceResult {
  lineTotal: number;
  unitPrice: number;
  orderQuantity: number;
  isTierPricing: boolean;
}

/** Normalize DB JSON — supports option_prices and legacy quantity_tiers / option_addons. */
export function normalizePricingRules(raw: unknown): ProductPricingRules | null {
  if (!raw || typeof raw !== "object") return null;
  const rules = raw as ProductPricingRules & {
    quantity_tiers?: Record<string, number>;
    option_addons?: Record<string, Record<string, number>>;
  };

  const option_prices: Record<string, Record<string, number>> = {
    ...(rules.option_prices ?? {}),
  };

  if (rules.quantity_tiers) {
    option_prices.quantity = {
      ...(option_prices.quantity ?? {}),
      ...rules.quantity_tiers,
    };
  }

  if (rules.option_addons) {
    for (const [field, values] of Object.entries(rules.option_addons)) {
      option_prices[field] = { ...(option_prices[field] ?? {}), ...values };
    }
  }

  return { option_prices };
}

export function getStartingPrice(
  basePrice: number,
  rules: ProductPricingRules | null | undefined
): number {
  const lowest = getLowestQuantityPrice(rules?.option_prices ?? {});
  if (lowest != null) return lowest;
  return basePrice;
}

export function calculateLinePrice(
  basePrice: number,
  pricingRules: ProductPricingRules | null | undefined,
  selectedOptions: Record<string, string>,
  context?: PricingContext
): LinePriceResult {
  const isBusinessCard = usesBusinessCardPricing(
    context?.category,
    context?.optionsSchema
  );

  const orderQuantity = parseQuantityFromOptions(selectedOptions);
  const qtySelection = selectedOptions.quantity?.trim();

  let optionPrices = pricingRules?.option_prices ?? {};

  if (isBusinessCard && context?.optionsSchema) {
    optionPrices = resolveOptionPrices(
      basePrice,
      context.optionsSchema,
      pricingRules
    );
  }

  let lineTotal: number;
  let isTierPricing = false;

  if (qtySelection && optionPrices.quantity?.[qtySelection] != null) {
    lineTotal = Number(optionPrices.quantity[qtySelection]);
    isTierPricing = true;
  } else if (isBusinessCard) {
    lineTotal = getStartingPrice(basePrice, { option_prices: optionPrices });
    isTierPricing = true;
  } else if (qtySelection && optionPrices.quantity) {
    lineTotal = basePrice;
    isTierPricing = true;
  } else {
    lineTotal = getCartLineTotal(basePrice, orderQuantity);
  }

  for (const [fieldName, value] of Object.entries(selectedOptions)) {
    if (fieldName === "quantity" || !value) continue;
    const extra = optionPrices[fieldName]?.[value];
    if (extra != null && Number(extra) > 0) {
      lineTotal += Number(extra);
    }
  }

  lineTotal = Math.round(lineTotal * 100) / 100;

  return {
    lineTotal,
    unitPrice: isTierPricing ? lineTotal : basePrice,
    orderQuantity,
    isTierPricing,
  };
}

export function buildPricingDraft(product: {
  price: number;
  options_schema: OptionsSchema;
  pricing_rules?: ProductPricingRules | null;
}): Record<string, Record<string, number>> {
  return resolveOptionPrices(
    product.price,
    product.options_schema,
    normalizePricingRules(product.pricing_rules)
  );
}

export function pricingRulesFromDraft(
  optionPrices: Record<string, Record<string, string | number>>
): ProductPricingRules {
  const option_prices: Record<string, Record<string, number>> = {};

  for (const [field, values] of Object.entries(optionPrices)) {
    option_prices[field] = {};
    for (const [opt, val] of Object.entries(values)) {
      const n = Number(val);
      if (Number.isFinite(n) && n >= 0) option_prices[field][opt] = n;
    }
  }

  return { option_prices };
}

export function previewTotalFromDraft(
  optionPrices: Record<string, Record<string, number>>
): number {
  return getLowestQuantityPrice(optionPrices) ?? 0;
}
