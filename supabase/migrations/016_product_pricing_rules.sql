-- Option-based pricing: quantity tiers + per-option add-ons (managed in admin)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS pricing_rules JSONB NOT NULL DEFAULT '{}';

COMMENT ON COLUMN products.pricing_rules IS
  'JSON: { "quantity_tiers": { "500": 49.99 }, "option_addons": { "finish": { "UV Gloss": 8 } } }';
