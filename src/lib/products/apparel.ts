import type { OptionField, OptionsSchema, Product } from "@/lib/types";

/** Slugs whose product page shows the live apparel colour preview. */
const APPAREL_SLUGS = new Set([
  "custom-t-shirt-printing",
  "custom-long-sleeve-t-shirt-printing",
  "custom-polo-printing",
  "custom-hoodie-printing",
  "custom-hats",
  "tote-bags",
]);

export function isApparelProduct(p: Pick<Product, "slug" | "category">): boolean {
  return APPAREL_SLUGS.has(p.slug) || p.category === "Apparel";
}

export type GarmentShape = "shirt" | "longsleeve" | "hoodie" | "hat" | "tote";

export function garmentShapeForSlug(slug: string): GarmentShape {
  if (slug.includes("long-sleeve")) return "longsleeve";
  if (slug.includes("hoodie")) return "hoodie";
  if (slug.includes("hat")) return "hat";
  if (slug.includes("tote") || slug.includes("bag")) return "tote";
  return "shirt";
}

/** name → { hex, text } — `text` is a legible foreground colour for the label chip. */
export const APPAREL_COLOR_HEX: Record<string, { hex: string; text: string }> = {
  White: { hex: "#ffffff", text: "#0f172a" },
  "Heather Gray": { hex: "#b6bcc4", text: "#0f172a" },
  Beige: { hex: "#d8c8a8", text: "#0f172a" },
  Cream: { hex: "#f4ecd6", text: "#0f172a" },
  Yellow: { hex: "#f6c945", text: "#0f172a" },
  "Light Blue": { hex: "#8ec9e8", text: "#0f172a" },
  Pink: { hex: "#eda0c0", text: "#0f172a" },
  Orange: { hex: "#e8863b", text: "#0f172a" },
  Red: { hex: "#c02c33", text: "#ffffff" },
  Maroon: { hex: "#6d1f28", text: "#ffffff" },
  Brown: { hex: "#5a3a26", text: "#ffffff" },
  Green: { hex: "#2f8f4e", text: "#ffffff" },
  "Forest Green": { hex: "#1f4d33", text: "#ffffff" },
  Purple: { hex: "#5b3b8c", text: "#ffffff" },
  Navy: { hex: "#1e2a4a", text: "#ffffff" },
  "Royal Blue": { hex: "#2551c4", text: "#ffffff" },
  Charcoal: { hex: "#37414c", text: "#ffffff" },
  Black: { hex: "#161a1f", text: "#ffffff" },
};

export function colorHex(name: string): string {
  return APPAREL_COLOR_HEX[name]?.hex ?? "#e2e8f0";
}
export function colorTextOn(name: string): string {
  return APPAREL_COLOR_HEX[name]?.text ?? "#0f172a";
}
export function isLightColor(name: string): boolean {
  return APPAREL_COLOR_HEX[name]?.text === "#0f172a";
}

/** The `*_color` field on an apparel product (shirt_color / polo_color / …). */
export function getColorField(schema: OptionsSchema): OptionField | undefined {
  return schema.fields.find((f) => f.name.endsWith("_color") && (f.options?.length ?? 0) > 0);
}

/** A `size` / `size_breakdown` free-text field is common — not used for the grid. */
export function getSizeField(schema: OptionsSchema): OptionField | undefined {
  return schema.fields.find(
    (f) => f.name === "size" && f.type !== "textarea" && (f.options?.length ?? 0) > 0,
  );
}
