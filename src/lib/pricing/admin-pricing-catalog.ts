import type { ProductCategory } from "@/lib/types";

/** One admin pricing group (Business Cards, Print Materials, …). */
export interface AdminPricingSectionConfig {
  id: string;
  label: string;
  description: string;
  category: ProductCategory;
  /** Products matched by slug prefix (e.g. business-cards-*) */
  slugPrefix?: string;
  /** Products matched by explicit slug list (e.g. flyers, brochures) */
  slugs?: readonly string[];
  /**
   * "tiered" (default) → full quantity-tier + per-option add-on editor, and the
   * storefront runs these products through `calculateLinePrice`'s option-pricing
   * path (`isOptionPricingSlug`).
   * "simple" → base-price-only editor; the storefront keeps its existing flat
   * `price × quantity` / quote behaviour (NOT counted by `isOptionPricingSlug`).
   */
  pricingMode?: "tiered" | "simple";
}

/**
 * Registry of products editable in /admin/prices.
 * Add a slug here (or a new section) when a product gets option-based pricing.
 */
export const ADMIN_PRICING_SECTIONS: AdminPricingSectionConfig[] = [
  {
    id: "apparel",
    label: "Apparel",
    description: "Custom apparel and headwear",
    category: "Apparel",
    slugs: [
      "custom-t-shirt-printing",
      "custom-long-sleeve-t-shirt-printing",
      "custom-polo-printing",
      "custom-hoodie-printing",
      "custom-hats",
    ],
  },
  {
    id: "business-cards",
    label: "Business Cards",
    description: "Standard, premium, and specialty card lines",
    category: "Business Cards",
    slugPrefix: "business-cards-",
  },
  {
    id: "print-materials",
    label: "Print Materials",
    description: "Flyers, postcards, brochures, and other print products",
    category: "Print Materials",
    slugs: [
      "flyers",
      "postcards",
      "brochures",
      "bookmarks",
      "door-hangers",
      "folders",
      "posters",
    ],
  },
  {
    id: "large-format",
    label: "Large Format",
    description: "Signs, banners, yard signs, canvas, and wide-format displays",
    category: "Large Format",
    slugs: [
      "coroplast-signs",
      "floor-graphics",
      "foam-board",
      "aluminum-signs",
      "banners",
      "roll-up-banners",
      "car-door-magnets",
      "table-covers",
      "adhesive-vinyl",
      "window-graphics",
      "large-format-posters",
      "styrene-signs",
      "display-board-pop",
      "canvas-prints",
      "sintra-pvc",
      "x-frame-banners",
      "a-frame-signs",
      "wall-decals",
      "a-frame-stands",
      "h-stands",
    ],
  },
  {
    id: "promotional-products",
    label: "Promotional Products",
    description: "Mugs, tumblers, and branded merchandise — flat per-unit pricing",
    category: "Promotional Products",
    slugs: ["custom-mugs", "custom-tumblers", "branded-merchandise"],
    pricingMode: "simple",
  },
  {
    id: "marketing-services",
    label: "Marketing Services",
    description: "Design, branding, and content services — starting-price only",
    category: "Marketing Services",
    slugs: [
      "graphic-design-services",
      "branding",
      "social-media-management",
      "video-production",
      "content-creation",
    ],
    pricingMode: "simple",
  },
];

/** Sections whose products use the full quantity-tier / option-pricing engine. */
export const TIERED_PRICING_SECTIONS: AdminPricingSectionConfig[] =
  ADMIN_PRICING_SECTIONS.filter((s) => s.pricingMode !== "simple");

export function sectionMatchesSlug(
  section: AdminPricingSectionConfig,
  slug: string
): boolean {
  if (section.slugPrefix) return slug.startsWith(section.slugPrefix);
  if (section.slugs?.length) return section.slugs.includes(slug);
  return false;
}

export function expectedSlugsForSection(
  section: AdminPricingSectionConfig
): readonly string[] {
  return section.slugs ?? [];
}

/** The TIERED section a slug belongs to (used by the storefront pricing engine). */
export function getAdminPricingSectionForSlug(
  slug: string
): AdminPricingSectionConfig | undefined {
  return TIERED_PRICING_SECTIONS.find((section) =>
    sectionMatchesSlug(section, slug)
  );
}

/** Any admin-pricing section a slug belongs to (tiered OR simple) — admin UI only. */
export function getEditablePricingSectionForSlug(
  slug: string
): AdminPricingSectionConfig | undefined {
  return ADMIN_PRICING_SECTIONS.find((section) =>
    sectionMatchesSlug(section, slug)
  );
}

/** Slugs that use seed options_schema + option-tier pricing on the storefront. */
export function isOptionPricingSlug(slug: string): boolean {
  return getAdminPricingSectionForSlug(slug) != null;
}

/** @deprecated Use isOptionPricingSlug */
export function usesSeedOptionsSchema(slug: string): boolean {
  return isOptionPricingSlug(slug);
}

export const SEED_PRODUCT_ID_PREFIX = "seed:";

export function isSeedPricingProductId(id: string): boolean {
  return id.startsWith(SEED_PRODUCT_ID_PREFIX);
}
