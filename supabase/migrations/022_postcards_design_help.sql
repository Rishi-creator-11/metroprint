-- Add Need Design Help to flyers/postcards; ensure postcards product exists

INSERT INTO products (
  title,
  slug,
  category,
  description,
  base_price_text,
  image_url,
  options_schema,
  active,
  price,
  pricing_rules
) VALUES (
  'Postcards',
  'postcards',
  'Print Materials',
  'Custom postcards for direct mail, promotions, and events. Choose size, 14pt or 16pt C2S stock, quantity, and sides — upload your artwork at checkout.',
  'Starting at $39/500',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=600&fit=crop',
  '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["250","500","1,000","2,500","5,000","10,000","Custom order"],"required":true},{"name":"size","label":"Size","type":"select","options":["4\" x 6\"","5\" x 7\"","5.5\" x 8.5\"","6\" x 9\"","6\" x 11\"","5\" x 8\"","4\" x 9\"","4\" x 4\"","6\" x 6\"","3.67\" x 8.5\""],"required":true},{"name":"stock","label":"Stock","type":"select","options":["14pt C2S","16pt C2S"],"required":true},{"name":"sides","label":"Sides","type":"select","options":["Single Sided","Double Sided"],"required":true},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}'::jsonb,
  true,
  39.99,
  '{"option_prices":{"quantity":{"250":33.99,"500":39.99,"1,000":53.99,"2,500":79.98,"5,000":111.97,"10,000":159.96,"Custom order":0},"size":{"4\" x 6\"":0,"5\" x 7\"":0,"5.5\" x 8.5\"":0,"6\" x 9\"":0,"6\" x 11\"":0,"5\" x 8\"":0,"4\" x 9\"":0,"4\" x 4\"":0,"6\" x 6\"":0,"3.67\" x 8.5\"":0},"stock":{"14pt C2S":0,"16pt C2S":3},"sides":{"Single Sided":0,"Double Sided":5},"need_design_help":{"Yes":0,"No":0}}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  base_price_text = EXCLUDED.base_price_text,
  image_url = EXCLUDED.image_url,
  options_schema = EXCLUDED.options_schema,
  active = EXCLUDED.active,
  price = EXCLUDED.price,
  pricing_rules = EXCLUDED.pricing_rules;

UPDATE products p
SET options_schema = jsonb_set(
  p.options_schema,
  '{fields}',
  p.options_schema->'fields' || '[{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]'::jsonb
)
WHERE p.slug IN ('flyers', 'postcards')
  AND NOT EXISTS (
    SELECT 1
    FROM jsonb_array_elements(p.options_schema->'fields') AS field
    WHERE field->>'name' = 'need_design_help'
  );

SELECT slug, active FROM products WHERE slug IN ('flyers', 'postcards') ORDER BY slug;
