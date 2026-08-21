/*
# Add Business Card Product Imagery and Production Specs

1. Product imagery
- Adds a distinct public image URL for each active Business Cards product.
- Images are presentation imagery only and can be replaced later with MetroPrint-owned photography.

2. Product options
- Removes unsupported `stock` and `finish` option fields from every Business Cards product.
- Keeps the existing product-specific configuration fields such as quantity, size, sides, material, shape, foil color, edge color, fold direction, and turnaround.

3. Data safety
- Updates existing product rows only.
- Does not delete products, change table structure, or alter customer/order records.
- The update is safe to run more than once.
*/

UPDATE products
SET image_url = CASE slug
  WHEN 'bc-standard-matte' THEN 'https://images.pexels.com/photos/4862950/pexels-photo-4862950.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
  WHEN 'bc-standard-uv-gloss' THEN 'https://images.pexels.com/photos/5706020/pexels-photo-5706020.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
  WHEN 'bc-premium-metallic-foil-raised' THEN 'https://images.pexels.com/photos/6149103/pexels-photo-6149103.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
  WHEN 'bc-premium-kraft-paper' THEN 'https://images.pexels.com/photos/8250871/pexels-photo-8250871.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
  WHEN 'bc-premium-durable' THEN 'https://images.pexels.com/photos/8066713/pexels-photo-8066713.png?auto=compress&cs=tinysrgb&h=650&w=940'
  WHEN 'bc-premium-spot-uv-raised' THEN 'https://images.pexels.com/photos/5706018/pexels-photo-5706018.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
  WHEN 'bc-premium-pearl-paper' THEN 'https://images.pexels.com/photos/346553/pexels-photo-346553.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
  WHEN 'bc-premium-die-cut' THEN 'https://images.pexels.com/photos/5705980/pexels-photo-5705980.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
  WHEN 'bc-premium-soft-touch-suede' THEN 'https://images.pexels.com/photos/4862926/pexels-photo-4862926.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
  WHEN 'bc-premium-32pt-painted-edge' THEN 'https://images.pexels.com/photos/9878733/pexels-photo-9878733.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
  WHEN 'bc-premium-ultra-smooth' THEN 'https://images.pexels.com/photos/11149812/pexels-photo-11149812.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
  WHEN 'bc-specialty-fold-over' THEN 'https://images.pexels.com/photos/9869077/pexels-photo-9869077.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
  WHEN 'bc-specialty-plastic' THEN 'https://images.pexels.com/photos/7821730/pexels-photo-7821730.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
  WHEN 'bc-specialty-magnetic' THEN 'https://images.pexels.com/photos/15569097/pexels-photo-15569097.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
  ELSE image_url
END
WHERE category = 'Business Cards';

UPDATE products
SET options_schema = jsonb_set(
  options_schema,
  '{fields}',
  COALESCE(
    (
      SELECT jsonb_agg(field)
      FROM jsonb_array_elements(options_schema->'fields') AS field
      WHERE COALESCE(field->>'name', '') NOT IN ('stock', 'finish')
    ),
    '[]'::jsonb
  ),
  true
)
WHERE category = 'Business Cards';