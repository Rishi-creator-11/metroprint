import { BUSINESS_CARD_QUANTITY_OPTIONS } from "@/lib/pricing/business-card-quantities";
import { withDesignHelpField } from "@/lib/products/options/product-options-shared";
import type { OptionsSchema } from "@/lib/types";

export const FOLDER_SLUG = "folders";

export const FOLDER_SIZE_OPTIONS = [
  '5.25" x 10.5"',
  '6" x 9"',
  '9" x 12" - 3 inch Pocket',
  '9" x 12" - 4 inch Pocket',
  '9" x 14.5" - 3 inch Pocket',
  '9" x 14.5" - 4 inch Pocket',
] as const;

export const FOLDER_SLIT_OPTIONS = [
  "None",
  "Right Side",
  "Left Side",
  "Both Sides",
] as const;

export function folderOptionsSchema(): OptionsSchema {
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
        options: [...FOLDER_SIZE_OPTIONS],
        required: true,
      },
      {
        name: "pockets",
        label: "Pockets",
        type: "radio",
        options: ["Yes", "No"],
        required: true,
      },
      {
        name: "business_card_slit",
        label: "Business Card Slit",
        type: "select",
        options: [...FOLDER_SLIT_OPTIONS],
        required: true,
      },
    ],
  });
}
