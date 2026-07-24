-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  base_price_text TEXT NOT NULL DEFAULT 'Request a quote',
  image_url TEXT,
  options_schema JSONB NOT NULL DEFAULT '{"fields":[]}',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Quote requests table
CREATE TABLE IF NOT EXISTS quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  selected_options JSONB NOT NULL DEFAULT '{}',
  notes TEXT,
  file_urls JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'approved', 'completed', 'cancelled')),
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_quote_requests_created_at ON quote_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- Storage bucket for artwork uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('quote-artwork', 'quote-artwork', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- Public can read active products
CREATE POLICY "Public can read active products"
  ON products FOR SELECT
  USING (active = true);

-- Public can insert quote requests
CREATE POLICY "Public can insert quote requests"
  ON quote_requests FOR INSERT
  WITH CHECK (true);

-- Authenticated admins can read all quote requests
CREATE POLICY "Admins can read quote requests"
  ON quote_requests FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated admins can update quote requests
CREATE POLICY "Admins can update quote requests"
  ON quote_requests FOR UPDATE
  TO authenticated
  USING (true);

-- Authenticated admins can read all products
CREATE POLICY "Admins can read all products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

-- Storage policies for quote artwork
CREATE POLICY "Public can upload quote artwork"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'quote-artwork');

CREATE POLICY "Public can read quote artwork"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'quote-artwork');

CREATE POLICY "Admins can manage quote artwork"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'quote-artwork');
