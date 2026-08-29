-- Flyers: MKT1 sizes, business-card quantity tiers, per-option pricing

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
        WHEN elem->>'name' = 'size' THEN
          jsonb_set(
            elem,
            '{options}',
            '["10.5\" x 17\"","11\" x 17\"","11.5\" x 17.5\"","12\" x 15\"","12\" x 18\"","17\" x 22\"","3.667\" x 8.5\"","4\" x 6\"","4\" x 8.5\"","4\" x 9\"","4\" x 10\"","4\" x 11\"","4\" x 12\"","4\" x 15\"","4.25\" x 5.5\"","4.25\" x 11\"","4.25\" x 12\"","5.5\" x 8.5\"","5.5\" x 17\"","6\" x 9\"","6\" x 11\"","6.25\" x 9\"","6.25\" x 11\"","6.5\" x 9\"","7\" x 8.5\"","7.5\" x 8.5\"","8\" x 9\"","8\" x 10\"","8.5\" x 11\"","8.5\" x 14\"","9\" x 12\"","9\" x 16\"","11\" x 25.5\""]'::jsonb
          )
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(p.options_schema->'fields') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE slug = 'flyers';

DO $$
DECLARE
  anchor numeric;
  qty_prices jsonb;
  size_prices jsonb := '{}'::jsonb;
  size_opt text;
  sizes text[] := ARRAY[
    '10.5" x 17"', '11" x 17"', '11.5" x 17.5"', '12" x 15"', '12" x 18"',
    '17" x 22"', '3.667" x 8.5"', '4" x 6"', '4" x 8.5"', '4" x 9"',
    '4" x 10"', '4" x 11"', '4" x 12"', '4" x 15"', '4.25" x 5.5"',
    '4.25" x 11"', '4.25" x 12"', '5.5" x 8.5"', '5.5" x 17"', '6" x 9"',
    '6" x 11"', '6.25" x 9"', '6.25" x 11"', '6.5" x 9"', '7" x 8.5"',
    '7.5" x 8.5"', '8" x 9"', '8" x 10"', '8.5" x 11"', '8.5" x 14"',
    '9" x 12"', '9" x 16"', '11" x 25.5"'
  ];
  r record;
BEGIN
  SELECT price, pricing_rules INTO r FROM products WHERE slug = 'flyers';

  anchor := COALESCE(
    NULLIF(r.pricing_rules->'option_prices'->'quantity'->>'500', '')::numeric,
    NULLIF(r.pricing_rules->'option_prices'->'quantity'->>'250', '')::numeric,
    r.price::numeric,
    49.99
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

  FOREACH size_opt IN ARRAY sizes LOOP
    size_prices := size_prices || jsonb_build_object(size_opt, 0);
  END LOOP;

  UPDATE products
  SET pricing_rules = jsonb_build_object(
    'option_prices',
    jsonb_build_object(
      'quantity', qty_prices,
      'size', size_prices,
      'paper_type', jsonb_build_object(
        '100lb Gloss', 0,
        '100lb Matte', 0,
        '80lb Text', 0
      ),
      'sides', jsonb_build_object(
        'Single Sided', 0,
        'Double Sided', COALESCE(
          NULLIF(r.pricing_rules->'option_prices'->'sides'->>'Double Sided', '')::numeric,
          5
        )
      )
    )
  )
  WHERE slug = 'flyers';
END $$;

SELECT slug, jsonb_array_length(options_schema->'fields'->1->'options') AS size_count
FROM products WHERE slug = 'flyers';
