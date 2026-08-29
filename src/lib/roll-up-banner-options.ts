import { BUSINESS_CARD_QUANTITY_OPTIONS } from "@/lib/business-card-quantities";
import { withDesignHelpField } from "@/lib/product-options-shared";
import type { OptionsSchema } from "@/lib/types";

export const ROLL_UP_BANNER_SLUG = "roll-up-banners";

export function rollUpBannerOptionsSchema(): OptionsSchema {
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
        options: ['33" x 81"'],
        required: true,
      },
      {
        name: "metal_stand",
        label: "Include Metal Stand",
        type: "radio",
        options: ["Standard", "Premium"],
        required: true,
      },
    ],
  });
}
