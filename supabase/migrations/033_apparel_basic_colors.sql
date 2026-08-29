-- Expand the basic apparel color palette for shirts, polos, hoodies, and hats.

DO $$
DECLARE
  product_slug text;
  color_field text;
  color_options jsonb := '["White","Black","Heather Gray","Charcoal","Navy","Royal Blue","Light Blue","Red","Maroon","Green","Forest Green","Yellow","Orange","Pink","Purple","Brown","Beige","Cream"]'::jsonb;
  color_prices jsonb := '{"White":0,"Black":0,"Heather Gray":0,"Charcoal":0,"Navy":0,"Royal Blue":0,"Light Blue":0,"Red":0,"Maroon":0,"Green":0,"Forest Green":0,"Yellow":0,"Orange":0,"Pink":0,"Purple":0,"Brown":0,"Beige":0,"Cream":0}'::jsonb;
BEGIN
  FOR product_slug, color_field IN
    VALUES
      ('custom-t-shirt-printing', 'shirt_color'),
      ('custom-long-sleeve-t-shirt-printing', 'shirt_color'),
      ('custom-polo-printing', 'polo_color'),
      ('custom-hoodie-printing', 'hoodie_color'),
      ('custom-hats', 'hat_color')
  LOOP
    UPDATE products p
    SET
      options_schema = jsonb_set(
        p.options_schema,
        '{fields}',
        (
          SELECT jsonb_agg(
            CASE
              WHEN field->>'name' = color_field THEN
                jsonb_set(
                  jsonb_set(field, '{type}', '"select"'::jsonb),
                  '{options}',
                  color_options
                ) - 'placeholder'
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
        ARRAY['option_prices', color_field],
        color_prices,
        true
      )
    WHERE p.slug = product_slug;
  END LOOP;
END $$;

SELECT slug, options_schema, pricing_rules
FROM products
WHERE slug IN (
  'custom-t-shirt-printing',
  'custom-long-sleeve-t-shirt-printing',
  'custom-polo-printing',
  'custom-hoodie-printing',
  'custom-hats'
)
ORDER BY slug;
