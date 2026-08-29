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
      "roll-up-banners",
      "car-door-magnets",
    ],
  },
];

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

export function getAdminPricingSectionForSlug(
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
