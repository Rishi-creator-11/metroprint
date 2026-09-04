/** Shared quantity tiers for all business card products. */
export const BUSINESS_CARD_QUANTITY_OPTIONS = [
  "250",
  "500",
  "1,000",
  "2,500",
  "5,000",
  "10,000",
  "Custom order",
] as const;

export const CUSTOM_ORDER_QUANTITY = "Custom order";

export function isCustomOrderQuantity(value: string | undefined): boolean {
  return value === CUSTOM_ORDER_QUANTITY;
}
