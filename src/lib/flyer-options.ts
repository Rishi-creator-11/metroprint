import { BUSINESS_CARD_QUANTITY_OPTIONS } from "@/lib/business-card-quantities";
import { withDesignHelpField } from "@/lib/product-options-shared";
import type { OptionsSchema } from "@/lib/types";

/** MKT1 flyer / print size options. */
export const FLYER_SIZE_OPTIONS = [
  '10.5" x 17"',
  '11" x 17"',
  '11.5" x 17.5"',
  '12" x 15"',
  '12" x 18"',
  '17" x 22"',
  '3.667" x 8.5"',
  '4" x 6"',
  '4" x 8.5"',
  '4" x 9"',
  '4" x 10"',
  '4" x 11"',
  '4" x 12"',
  '4" x 15"',
  '4.25" x 5.5"',
  '4.25" x 11"',
  '4.25" x 12"',
  '5.5" x 8.5"',
  '5.5" x 17"',
  '6" x 9"',
  '6" x 11"',
  '6.25" x 9"',
  '6.25" x 11"',
  '6.5" x 9"',
  '7" x 8.5"',
  '7.5" x 8.5"',
  '8" x 9"',
  '8" x 10"',
  '8.5" x 11"',
  '8.5" x 14"',
  '9" x 12"',
  '9" x 16"',
  '11" x 25.5"',
] as const;

export const FLYER_PAPER_OPTIONS = [
  "100lb Gloss",
  "100lb Matte",
  "80lb Text",
] as const;

export const FLYER_SIDES_OPTIONS = ["Single Sided", "Double Sided"] as const;

export const FLYER_SLUG = "flyers";

export function flyerOptionsSchema(): OptionsSchema {
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
        options: [...FLYER_SIZE_OPTIONS],
        required: true,
      },
      {
        name: "paper_type",
        label: "Paper Type",
        type: "select",
        options: [...FLYER_PAPER_OPTIONS],
        required: true,
      },
      {
        name: "sides",
        label: "Sides",
        type: "select",
        options: [...FLYER_SIDES_OPTIONS],
        required: true,
      },
    ],
  });
}
