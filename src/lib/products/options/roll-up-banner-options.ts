import { BUSINESS_CARD_QUANTITY_OPTIONS } from "@/lib/pricing/business-card-quantities";
import { withDesignHelpField } from "@/lib/products/options/product-options-shared";
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
        name: "banner_type",
        label: "Banner Type",
        type: "select",
        options: [
          "13oz Matte Vinyl - Silver Base",
          "13oz Matte Vinyl - Black Base",
          "Premium Stand 13oz Matte Vinyl",
          "Table Top 13oz Matte Vinyl",
          "Premium Wide 13oz Matte Vinyl",
          "Double Sided 13oz Matte Vinyl",
        ],
        required: true,
      },
      {
        name: "size",
        label: "Size",
        type: "select",
        options: ['33" x 81"'],
        required: true,
      },
    ],
  });
}
