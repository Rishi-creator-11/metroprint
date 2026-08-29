import { getProductPrice } from "@/lib/product-prices";
import { normalizePricingRules } from "@/lib/pricing";
import { getSeedProductBySlug } from "@/lib/products-data";
import {
  ADMIN_PRICING_SECTIONS,
  expectedSlugsForSection,
  isOptionPricingSlug,
  SEED_PRODUCT_ID_PREFIX,
  type AdminPricingSectionConfig,
} from "@/lib/admin-pricing-catalog";
import type { OptionsSchema, ProductCategory, ProductPricingRules } from "@/lib/types";
import type { AdminPricingProduct } from "@/components/admin/AdminPricingHub";

export interface AdminPricingSection {
  id: string;
  label: string;
  description: string;
  products: AdminPricingProduct[];
}

type ProductRow = {
  id: string;
  title: string;
  slug: string;
  category: string;
  price: number | null;
  active: boolean;
  options_schema: OptionsSchema | null;
  pricing_rules: unknown;
  subcategory: string | null;
};

function mapProductRow(row: ProductRow): AdminPricingProduct {
  const seed = getSeedProductBySlug(row.slug);
  const options_schema = (isOptionPricingSlug(row.slug) && seed?.options_schema
    ? seed.options_schema
    : row.options_schema ?? { fields: [] }) as OptionsSchema;

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.category as ProductCategory,
    price: getProductPrice(row.slug, row.price != null ? Number(row.price) : null),
    active: row.active,
    options_schema,
    pricing_rules: normalizePricingRules(row.pricing_rules) as ProductPricingRules | null,
    subcategory: row.subcategory ?? seed?.subcategory ?? null,
  };
}

function seedFallbackProduct(slug: string): AdminPricingProduct | null {
  const seed = getSeedProductBySlug(slug);
  if (!seed) return null;

  return {
    id: `${SEED_PRODUCT_ID_PREFIX}${slug}`,
    title: seed.title,
    slug: seed.slug,
    category: seed.category as ProductCategory,
    price: getProductPrice(slug, null),
    active: seed.active ?? true,
    options_schema: seed.options_schema,
    pricing_rules: null,
    subcategory: seed.subcategory ?? null,
  };
}

function mergeSectionWithSeed(
  dbProducts: AdminPricingProduct[],
  section: AdminPricingSectionConfig
): AdminPricingProduct[] {
  const expected = expectedSlugsForSection(section);
  if (!expected.length) return dbProducts;

  const bySlug = new Map(dbProducts.map((p) => [p.slug, p]));
  const merged = [...dbProducts];

  for (const slug of expected) {
    if (bySlug.has(slug)) continue;
    const fallback = seedFallbackProduct(slug);
    if (fallback) merged.push(fallback);
  }

  return merged.sort((a, b) => a.title.localeCompare(b.title));
}

async function fetchSectionProducts(
  supabase: Awaited<
    ReturnType<typeof import("@/lib/supabase/server").createServiceClient>
  >,
  section: AdminPricingSectionConfig
): Promise<AdminPricingProduct[]> {
  let query = supabase
    .from("products")
    .select(
      "id, title, slug, category, price, active, options_schema, pricing_rules, subcategory"
    )
    .eq("category", section.category)
    .eq("active", true);

  if (section.slugPrefix) {
    query = query.like("slug", `${section.slugPrefix}%`);
  } else if (section.slugs?.length) {
    query = query.in("slug", [...section.slugs]);
  }

  const { data } = await query.order("subcategory").order("title");
  const dbProducts = (data || []).map((row) => mapProductRow(row as ProductRow));
  return mergeSectionWithSeed(dbProducts, section);
}

export async function loadAdminPricingSections(
  supabase: Awaited<
    ReturnType<typeof import("@/lib/supabase/server").createServiceClient>
  >
): Promise<AdminPricingSection[]> {
  const sections: AdminPricingSection[] = [];

  for (const config of ADMIN_PRICING_SECTIONS) {
    const products = await fetchSectionProducts(supabase, config);
    if (products.length === 0) continue;
    sections.push({
      id: config.id,
      label: config.label,
      description: config.description,
      products,
    });
  }

  return sections;
}
