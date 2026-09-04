import { BUSINESS_CARD_QUANTITY_OPTIONS } from "@/lib/pricing/business-card-quantities";
import { withDesignHelpField } from "@/lib/products/options/product-options-shared";
import type { OptionsSchema } from "@/lib/types";

export const POSTER_SLUG = "posters";

export function posterOptionsSchema(): OptionsSchema {
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
        options: ['18" x 24"', '24" x 36"', '11" x 17"'],
        required: true,
      },
      {
        name: "paper_type",
        label: "Paper Type",
        type: "select",
        options: ["Glossy", "Matte", "Satin"],
        required: true,
      },
    ],
  });
}
