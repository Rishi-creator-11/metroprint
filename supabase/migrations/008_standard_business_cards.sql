-- Standard business cards: one product with stock, finish, and corner options

UPDATE products SET active = false
WHERE slug IN ('business-cards-standard-matte', 'business-cards-standard-uv-gloss');

INSERT INTO products (title, slug, category, description, base_price_text, image_url, options_schema, active, price) VALUES
(
  'Standard Business Cards',
  'business-cards-standard',
  'Business Cards',
  'Standard business cards from MetroPrint USA (MKT1). Choose stock weight, matte or UV gloss finish, corner style, quantity, and sides.',
  'Starting at $29/500',
  'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=600&fit=crop',
  '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["50","100","250","500","1000","2500","5000"],"required":true},{"name":"stock","label":"Stock","type":"select","options":["14pt","16pt","18pt"],"required":true},{"name":"finish","label":"Finish","type":"select","options":["Matte","UV Gloss"],"required":true},{"name":"corners","label":"Corners","type":"select","options":["Rectangle","Rounded"],"required":true},{"name":"sides","label":"Sides","type":"select","options":["Single Sided","Double Sided"],"required":true},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}',
  true,
  29.99
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  base_price_text = EXCLUDED.base_price_text,
  options_schema = EXCLUDED.options_schema,
  active = EXCLUDED.active,
  price = EXCLUDED.price;
