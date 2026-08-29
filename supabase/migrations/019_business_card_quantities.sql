-- Standardize business card quantity tiers across all MKT1 products
-- 250 → 500 → 1,000 → 2,500 → 5,000 → 10,000 → Custom order

UPDATE products p
SET options_schema = jsonb_set(
  p.options_schema,
  '{fields}',
  (
    SELECT jsonb_agg(
      CASE
        WHEN elem->>'name' = 'quantity' THEN
          jsonb_set(
            elem,
            '{options}',
            '["250","500","1,000","2,500","5,000","10,000","Custom order"]'::jsonb
          )
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(p.options_schema->'fields') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE category = 'Business Cards'
  AND slug LIKE 'business-cards-%';

DO $$
DECLARE
  r RECORD;
  anchor numeric;
  qty_prices jsonb;
BEGIN
  FOR r IN
    SELECT slug, price, pricing_rules
    FROM products
    WHERE category = 'Business Cards'
      AND slug LIKE 'business-cards-%'
  LOOP
    anchor := COALESCE(
      NULLIF(r.pricing_rules->'option_prices'->'quantity'->>'500', '')::numeric,
      NULLIF(r.pricing_rules->'option_prices'->'quantity'->>'250', '')::numeric,
      r.price::numeric
    );

    qty_prices := jsonb_build_object(
      '250', round((anchor * 0.85)::numeric, 2),
      '500', round(anchor::numeric, 2),
      '1,000', round((anchor * 1.35)::numeric, 2),
      '2,500', round((anchor * 2.0)::numeric, 2),
      '5,000', round((anchor * 2.8)::numeric, 2),
      '10,000', round((anchor * 4.0)::numeric, 2),
      'Custom order', 0
    );

    UPDATE products
    SET pricing_rules = jsonb_set(
      COALESCE(pricing_rules, '{}'::jsonb),
      '{option_prices,quantity}',
      qty_prices,
      true
    )
    WHERE slug = r.slug;
  END LOOP;
END $$;

SELECT slug, options_schema->'fields'->0->'options' AS quantity_options
FROM products
WHERE category = 'Business Cards'
  AND slug LIKE 'business-cards-%'
  AND active = true
ORDER BY slug;
