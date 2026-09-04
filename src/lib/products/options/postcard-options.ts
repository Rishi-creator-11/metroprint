import { BUSINESS_CARD_QUANTITY_OPTIONS } from "@/lib/pricing/business-card-quantities";
import { withDesignHelpField } from "@/lib/products/options/product-options-shared";
import type { OptionsSchema } from "@/lib/types";

export const POSTCARD_SLUG = "postcards";

/** MKT1 postcard size options. */
export const POSTCARD_SIZE_OPTIONS = [
  '4" x 6"',
  '5" x 7"',
  '5.5" x 8.5"',
  '6" x 9"',
  '6" x 11"',
  '5" x 8"',
  '4" x 9"',
  '4" x 4"',
  '6" x 6"',
  '3.67" x 8.5"',
] as const;

export const POSTCARD_STOCK_OPTIONS = ["14pt C2S", "16pt C2S"] as const;

export const POSTCARD_SIDES_OPTIONS = ["Single Sided", "Double Sided"] as const;

export function postcardOptionsSchema(): OptionsSchema {
  return withDesignHelpField({
    fields: [
      {
        name: "quantity",
        label: "Quantity",
        type: "select",
        options: [...BUSINESS_CARD_QUANTITY_OPTIONS],
        required: true,
      },
      {
        name: "size",
        label: "Size",
        type: "select",
        options: [...POSTCARD_SIZE_OPTIONS],
        required: true,
      },
      {
        name: "stock",
        label: "Stock",
        type: "select",
        options: [...POSTCARD_STOCK_OPTIONS],
        required: true,
      },
      {
        name: "sides",
        label: "Sides",
        type: "select",
        options: [...POSTCARD_SIDES_OPTIONS],
        required: true,
      },
    ],
  });
}
