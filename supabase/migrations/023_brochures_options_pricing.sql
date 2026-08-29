-- Brochures: sizes and selected fold types from the MKT1 catalog.
-- Keep this migration local until the current product-pricing batch is ready.

UPDATE products
SET
  description = 'Custom folded brochures for menus, mailers, guides, and marketing materials.',
  options_schema = '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["250","500","1,000","2,500","5,000","10,000","Custom order"],"required":true},{"name":"size","label":"Size","type":"select","options":["8.5\" x 11\"","8.5\" x 14\"","9\" x 12\"","11\" x 17\"","11\" x 25.5\"","17\" x 22\""],"required":true},{"name":"fold_type","label":"Fold Type","type":"select","options":["Half Fold","Z Fold","4 Panel Accordion Fold"],"required":true},{"name":"sides","label":"Sides","type":"select","options":["Single Sided","Double Sided"],"required":true},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}'::jsonb,
  pricing_rules = jsonb_build_object(
    'option_prices',
    jsonb_build_object(
      'quantity', jsonb_build_object(
        '250', COALESCE(NULLIF(pricing_rules->'option_prices'->'quantity'->>'250', '')::numeric, price::numeric, 89.99),
        '500', COALESCE(NULLIF(pricing_rules->'option_prices'->'quantity'->>'500', '')::numeric, 105.87),
        '1,000', COALESCE(NULLIF(pricing_rules->'option_prices'->'quantity'->>'1,000', '')::numeric, 142.93),
        '2,500', COALESCE(NULLIF(pricing_rules->'option_prices'->'quantity'->>'2,500', '')::numeric, 211.74),
        '5,000', COALESCE(NULLIF(pricing_rules->'option_prices'->'quantity'->>'5,000', '')::numeric, 296.44),
        '10,000', COALESCE(NULLIF(pricing_rules->'option_prices'->'quantity'->>'10,000', '')::numeric, 423.48),
        'Custom order', 0
      ),
      'size', jsonb_build_object(
        '8.5" x 11"', 0,
        '8.5" x 14"', 0,
        '9" x 12"', 0,
        '11" x 17"', 0,
        '11" x 25.5"', 0,
        '17" x 22"', 0
      ),
      'fold_type', jsonb_build_object(
        'Half Fold', 0,
        'Z Fold', 0,
        '4 Panel Accordion Fold', 0
      ),
      'sides', jsonb_build_object(
        'Single Sided', 0,
        'Double Sided', COALESCE(
          NULLIF(pricing_rules->'option_prices'->'sides'->>'Double Sided', '')::numeric,
          5
        )
      )
    )
  )
WHERE slug = 'brochures';

SELECT slug, options_schema, pricing_rules
FROM products
WHERE slug = 'brochures';
