-- Per-option-value product images (mainly apparel colours): selecting the value
-- on the product page swaps the main image. Shape: { "<option value>": "<url>" }.
-- Additive; existing rows default to '{}'.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS variant_images jsonb NOT NULL DEFAULT '{}'::jsonb;
