import { BUSINESS_CARD_QUANTITY_OPTIONS } from "@/lib/pricing/business-card-quantities";
import { withDesignHelpField } from "@/lib/products/options/product-options-shared";
import type { OptionField, OptionsSchema } from "@/lib/types";

export const LF_QUANTITY = [...BUSINESS_CARD_QUANTITY_OPTIONS];

export const LF_YARD_SIGN_SIZES = [
  '12" x 18"',
  '18" x 24"',
  '24" x 36"',
  '36" x 48"',
  '48" x 96"',
] as const;

export const LF_BANNER_SIZES = [
  '2\' x 4\'',
  '3\' x 6\'',
  '4\' x 8\'',
  '5\' x 10\'',
] as const;

export const LF_CANVAS_SIZES = [
  '16" x 20"',
  '18" x 24"',
  '24" x 36"',
  '30" x 40"',
  '36" x 48"',
] as const;

export const LF_FLOOR_GRAPHIC_SIZES = [
  '12" x 12"',
  '18" x 18"',
  '24" x 24"',
  '36" x 36"',
  '48" x 48"',
] as const;

const LF_LOCAL = (file: string) => `/images/products/large-format/${file}`;

/** SinaLite-style product mockups (clean renders on white/neutral backgrounds). */
export const LF_PRODUCT_IMAGES: Record<string, string> = {
  "coroplast-signs": LF_LOCAL("coroplast-signs.jpg"),
  "floor-graphics": LF_LOCAL("floor-graphics.png"),
  "foam-board": LF_LOCAL("foam-board.jpg"),
  "aluminum-signs": LF_LOCAL("aluminum-signs.png"),
  banners: LF_LOCAL("banners.png"),
  "roll-up-banners": LF_LOCAL("roll-up-banners.png"),
  "car-door-magnets": LF_LOCAL("car-door-magnets.jpg"),
  "table-covers": LF_LOCAL("table-covers.png"),
  "adhesive-vinyl": LF_LOCAL("adhesive-vinyl.png"),
  "window-graphics": LF_LOCAL("window-graphics.jpg"),
  "large-format-posters": LF_LOCAL("large-format-posters.jpg"),
  "styrene-signs": LF_LOCAL("styrene-signs.jpg"),
  "display-board-pop": LF_LOCAL("display-board-pop.jpg"),
  "canvas-prints": LF_LOCAL("canvas-prints.jpg"),
  "sintra-pvc": LF_LOCAL("sintra-pvc.jpg"),
  "x-frame-banners": LF_LOCAL("x-frame-banners.jpg"),
  "a-frame-signs": LF_LOCAL("a-frame-signs.jpg"),
  "wall-decals": LF_LOCAL("wall-decals.png"),
  "a-frame-stands": LF_LOCAL("a-frame-stands.jpg"),
  "h-stands": LF_LOCAL("h-stands.jpg"),
};

export const LF_LARGE_FORMAT_IMAGE = LF_PRODUCT_IMAGES["roll-up-banners"];

export function largeFormatProductImage(slug: string): string {
  return LF_PRODUCT_IMAGES[slug] ?? LF_LARGE_FORMAT_IMAGE;
}

function quantityField(): OptionField {
  return {
    name: "quantity",
    label: "Quantity",
    type: "select",
    options: LF_QUANTITY,
    required: true,
  };
}

export function largeFormatOptions(extraFields: OptionField[]): OptionsSchema {
  return withDesignHelpField({
    fields: [quantityField(), ...extraFields],
  });
}

export function selectField(
  name: string,
  label: string,
  options: readonly string[]
): OptionField {
  return {
    name,
    label,
    type: "select",
    options: [...options],
    required: true,
  };
}
