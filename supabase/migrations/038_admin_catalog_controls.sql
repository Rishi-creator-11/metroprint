-- Admin control-center support: display ordering, homepage featuring, a managed
-- categories table, and a product-image storage bucket.
-- Purely additive. Existing rows/columns/policies untouched.

-- 1. Ordering + featuring on products -----------------------------------------
ALTER TABLE products ADD COLUMN IF NOT EXISTS sort_order integer;      -- within-category display order (nulls sort last)
ALTER TABLE products ADD COLUMN IF NOT EXISTS featured_rank integer;   -- homepage "Popular" order; NULL = not featured

-- 2. Managed categories ------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text UNIQUE NOT NULL,
  slug       text UNIQUE NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url  text,
  sort_order integer NOT NULL DEFAULT 0,
  visible    boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read visible categories" ON categories;
CREATE POLICY "Public can read visible categories"
  ON categories FOR SELECT
  USING (visible = true);
-- writes go through service-role API routes only (no authenticated write policy)

-- Seed from the current code constants (idempotent).
INSERT INTO categories (name, slug, description, image_url, sort_order, visible) VALUES
  ('Business Cards',       'business-cards',       'Standard, premium & custom cards — MetroPrint USA MKT1', 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=400&fit=crop', 1, true),
  ('Print Materials',      'print-materials',      'Flyers, brochures, postcards & more',                    'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&h=400&fit=crop', 2, true),
  ('Large Format',         'large-format',         'Signs, banners, yard signs, canvas & wide-format displays', '/images/products/large-format/roll-up-banners.png', 3, true),
  ('Apparel',              'apparel',              'Custom t-shirts, polos, hoodies, hats & tote bags',      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=400&fit=crop', 4, true),
  ('Marketing Services',   'marketing-services',   'Graphic design, branding, social media & video',         'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop', 5, true),
  ('Promotional Products', 'promotional-products', 'Mugs, tumblers & branded merchandise',                   'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=400&fit=crop', 6, true)
ON CONFLICT (name) DO NOTHING;

-- 3. Product image storage bucket ------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can read product images" ON storage.objects;
CREATE POLICY "Public can read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Authenticated can manage product images" ON storage.objects;
CREATE POLICY "Authenticated can manage product images"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'product-images')
  WITH CHECK (bucket_id = 'product-images');
