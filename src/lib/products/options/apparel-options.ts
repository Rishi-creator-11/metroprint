import { withDesignHelpField } from "@/lib/products/options/product-options-shared";
import type { OptionsSchema } from "@/lib/types";

export const APPAREL_QUANTITY_OPTIONS = ["1", "6", "12", "48", "96"] as const;
export const BASIC_APPAREL_COLORS = [
  "White",
  "Black",
  "Heather Gray",
  "Charcoal",
  "Navy",
  "Royal Blue",
  "Light Blue",
  "Red",
  "Maroon",
  "Green",
  "Forest Green",
  "Yellow",
  "Orange",
  "Pink",
  "Purple",
  "Brown",
  "Beige",
  "Cream",
] as const;
export const APPAREL_PRINT_LOCATIONS = ["Front", "Back", "Front and Back"] as const;
export const T_SHIRT_MATERIAL_OPTIONS = ["Cotton", "Polyester"] as const;

type ApparelSchemaOptions = {
  colorName: string;
  colorLabel: string;
  includeMaterial?: boolean;
};

export function apparelPrintingOptionsSchema({
  colorName,
  colorLabel,
  includeMaterial = false,
}: ApparelSchemaOptions): OptionsSchema {
  const fields: OptionsSchema["fields"] = [
    {
      name: "quantity",
      label: "Quantity",
      type: "select",
      options: [...APPAREL_QUANTITY_OPTIONS],
      required: true,
    },
  ];

  if (includeMaterial) {
    fields.push({
      name: "material",
      label: "Material",
      type: "radio",
      options: [...T_SHIRT_MATERIAL_OPTIONS],
      required: true,
    });
  }

  fields.push(
    {
      name: colorName,
      label: colorLabel,
      type: "select",
      options: [...BASIC_APPAREL_COLORS],
      required: true,
    },
    {
      name: "print_location",
      label: "Print Location",
      type: "radio",
      options: [...APPAREL_PRINT_LOCATIONS],
      required: true,
    },
    {
      name: "size_breakdown",
      label: "Size Breakdown",
      type: "textarea",
      placeholder: "e.g. S:2, M:5, L:8, XL:3",
      required: false,
    }
  );

  return withDesignHelpField({ fields });
}
