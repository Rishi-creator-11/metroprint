-- Standardize all admin-priced Apparel products to 1, 6, 12, 48, and 96 units.

DO $$
DECLARE
  product_slug text;
BEGIN
  FOREACH product_slug IN ARRAY ARRAY[
    'custom-t-shirt-printing',
    'custom-long-sleeve-t-shirt-printing',
    'custom-polo-printing',
    'custom-hoodie-printing',
    'custom-hats'
  ]
  LOOP
    UPDATE products p
    SET
      options_schema = jsonb_set(
        p.options_schema,
        '{fields}',
        (
          SELECT jsonb_agg(
            CASE
              WHEN field->>'name' = 'quantity' THEN
                jsonb_set(field, '{options}', '["1","6","12","48","96"]'::jsonb)
              ELSE field
            END
            ORDER BY ord
          )
          FROM jsonb_array_elements(p.options_schema->'fields')
            WITH ORDINALITY AS fields(field, ord)
        )
      ),
      pricing_rules = jsonb_set(
        COALESCE(p.pricing_rules, '{"option_prices":{}}'::jsonb),
        '{option_prices,quantity}',
        jsonb_build_object(
          '1', p.price,
          '6', round(p.price::numeric * 6, 2),
          '12', round(p.price::numeric * 12, 2),
          '48', round(p.price::numeric * 48, 2),
          '96', round(p.price::numeric * 96, 2)
        ),
        true
      )
    WHERE p.slug = product_slug;
  END LOOP;
END $$;

SELECT
  slug,
  options_schema->'fields'->0->'options' AS quantities,
  pricing_rules->'option_prices'->'quantity' AS quantity_prices
FROM products
WHERE slug IN (
  'custom-t-shirt-printing',
  'custom-long-sleeve-t-shirt-printing',
  'custom-polo-printing',
  'custom-hoodie-printing',
  'custom-hats'
)
ORDER BY slug;
