import { BUSINESS_CARD_QUANTITY_OPTIONS } from "@/lib/business-card-quantities";
import { withDesignHelpField } from "@/lib/product-options-shared";
import type { OptionsSchema } from "@/lib/types";

export const BROCHURE_SLUG = "brochures";

export const BROCHURE_SIZE_OPTIONS = [
  '8.5" x 11"',
  '8.5" x 14"',
  '9" x 12"',
  '11" x 17"',
  '11" x 25.5"',
  '17" x 22"',
] as const;

export const BROCHURE_FOLD_TYPE_OPTIONS = [
  "Half Fold",
  "Z Fold",
  "4 Panel Accordion Fold",
] as const;

export const BROCHURE_SIDES_OPTIONS = ["Single Sided", "Double Sided"] as const;

export function brochureOptionsSchema(): OptionsSchema {
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
        options: [...BROCHURE_SIZE_OPTIONS],
        required: true,
      },
      {
        name: "fold_type",
        label: "Fold Type",
        type: "select",
        options: [...BROCHURE_FOLD_TYPE_OPTIONS],
        required: true,
      },
      {
        name: "sides",
        label: "Sides",
        type: "select",
        options: [...BROCHURE_SIDES_OPTIONS],
        required: true,
      },
    ],
  });
}
