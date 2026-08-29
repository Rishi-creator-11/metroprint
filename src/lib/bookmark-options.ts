import { BUSINESS_CARD_QUANTITY_OPTIONS } from "@/lib/business-card-quantities";
import {
  POSTCARD_SIDES_OPTIONS,
  POSTCARD_STOCK_OPTIONS,
} from "@/lib/postcard-options";
import { withDesignHelpField } from "@/lib/product-options-shared";
import type { OptionsSchema } from "@/lib/types";

export const BOOKMARK_SLUG = "bookmarks";

export const BOOKMARK_SIZE_OPTIONS = [
  '1.5" x 7"',
  '2.5" x 8.5"',
  '2" x 7"',
  '2" x 8"',
  '2.75" x 8.5"',
  '3" x 4"',
  '3.5" x 8.5"',
  '3.66" x 4.25"',
  '8.5" x 3.66"',
] as const;

export function bookmarkOptionsSchema(): OptionsSchema {
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
        options: [...BOOKMARK_SIZE_OPTIONS],
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
