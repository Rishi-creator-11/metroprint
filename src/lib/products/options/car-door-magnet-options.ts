import { BUSINESS_CARD_QUANTITY_OPTIONS } from "@/lib/pricing/business-card-quantities";
import { withDesignHelpField } from "@/lib/products/options/product-options-shared";
import type { OptionsSchema } from "@/lib/types";

export const CAR_DOOR_MAGNET_SLUG = "car-door-magnets";

export const CAR_DOOR_MAGNET_SIZE_OPTIONS = [
  '12" x 18"',
  '12" x 24"',
  '18" x 24"',
  '18" x 30"',
  '24" x 24"',
  '24" x 36"',
] as const;

export function carDoorMagnetOptionsSchema(): OptionsSchema {
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
        options: [...CAR_DOOR_MAGNET_SIZE_OPTIONS],
        required: true,
      },
      {
        name: "rounded_corners",
        label: "Rounded Corners",
        type: "radio",
        options: ["Yes", "No"],
        required: true,
      },
    ],
  });
}
