import { BUSINESS_CARD_QUANTITY_OPTIONS } from "@/lib/business-card-quantities";
import {
  POSTCARD_SIDES_OPTIONS,
  POSTCARD_STOCK_OPTIONS,
} from "@/lib/postcard-options";
import { withDesignHelpField } from "@/lib/product-options-shared";
import type { OptionsSchema } from "@/lib/types";

export const DOOR_HANGER_SLUG = "door-hangers";

export const DOOR_HANGER_SIZE_OPTIONS = ['4.25" x 11"', '8.5" x 3.5"'] as const;

export function doorHangerOptionsSchema(): OptionsSchema {
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
        options: [...DOOR_HANGER_SIZE_OPTIONS],
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
