-- Apparel printing: shared quantities, basic colors, print locations, and option pricing.

UPDATE products
SET
  options_schema = '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["1","5","10","25","50","100"],"required":true},{"name":"material","label":"Material","type":"radio","options":["Cotton","Polyester"],"required":true},{"name":"shirt_color","label":"Shirt Color","type":"select","options":["White","Black","Navy","Royal Blue","Red","Heather Gray"],"required":true},{"name":"print_location","label":"Print Location","type":"radio","options":["Front","Back","Front and Back"],"required":true},{"name":"size_breakdown","label":"Size Breakdown","type":"textarea","placeholder":"e.g. S:2, M:5, L:8, XL:3","required":false},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}'::jsonb,
  pricing_rules = jsonb_build_object('option_prices', jsonb_build_object(
    'quantity', jsonb_build_object('1', price, '5', round(price::numeric * 5, 2), '10', round(price::numeric * 10, 2), '25', round(price::numeric * 25, 2), '50', round(price::numeric * 50, 2), '100', round(price::numeric * 100, 2)),
    'material', jsonb_build_object('Cotton', 0, 'Polyester', 0),
    'shirt_color', jsonb_build_object('White', 0, 'Black', 0, 'Navy', 0, 'Royal Blue', 0, 'Red', 0, 'Heather Gray', 0),
    'print_location', jsonb_build_object('Front', 0, 'Back', 0, 'Front and Back', 0)
  ))
WHERE slug = 'custom-t-shirt-printing';

INSERT INTO products (
  title, slug, category, description, base_price_text, image_url,
  options_schema, active, price, pricing_rules
) VALUES (
  'Custom Long-Sleeve T-Shirt Printing',
  'custom-long-sleeve-t-shirt-printing',
  'Apparel',
  'Custom printed long-sleeve T-shirts for teams, businesses, events, and branded apparel.',
  'Starting at $24.99/shirt',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600&fit=crop',
  '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["1","5","10","25","50","100"],"required":true},{"name":"material","label":"Material","type":"radio","options":["Cotton","Polyester"],"required":true},{"name":"shirt_color","label":"Shirt Color","type":"select","options":["White","Black","Navy","Royal Blue","Red","Heather Gray"],"required":true},{"name":"print_location","label":"Print Location","type":"radio","options":["Front","Back","Front and Back"],"required":true},{"name":"size_breakdown","label":"Size Breakdown","type":"textarea","placeholder":"e.g. S:2, M:5, L:8, XL:3","required":false},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}'::jsonb,
  true,
  24.99,
  '{"option_prices":{"quantity":{"1":24.99,"5":124.95,"10":249.9,"25":624.75,"50":1249.5,"100":2499},"material":{"Cotton":0,"Polyester":0},"shirt_color":{"White":0,"Black":0,"Navy":0,"Royal Blue":0,"Red":0,"Heather Gray":0},"print_location":{"Front":0,"Back":0,"Front and Back":0}}}'::jsonb
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

UPDATE products
SET
  description = 'Professional custom printed polos for corporate teams, uniforms, and events.',
  image_url = 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
  options_schema = '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["1","5","10","25","50","100"],"required":true},{"name":"polo_color","label":"Polo Color","type":"select","options":["White","Black","Navy","Royal Blue","Red","Heather Gray"],"required":true},{"name":"print_location","label":"Print Location","type":"radio","options":["Front","Back","Front and Back"],"required":true},{"name":"size_breakdown","label":"Size Breakdown","type":"textarea","placeholder":"e.g. S:2, M:5, L:8, XL:3","required":false},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}'::jsonb,
  pricing_rules = jsonb_build_object('option_prices', jsonb_build_object(
    'quantity', jsonb_build_object('1', price, '5', round(price::numeric * 5, 2), '10', round(price::numeric * 10, 2), '25', round(price::numeric * 25, 2), '50', round(price::numeric * 50, 2), '100', round(price::numeric * 100, 2)),
    'polo_color', jsonb_build_object('White', 0, 'Black', 0, 'Navy', 0, 'Royal Blue', 0, 'Red', 0, 'Heather Gray', 0),
    'print_location', jsonb_build_object('Front', 0, 'Back', 0, 'Front and Back', 0)
  ))
WHERE slug = 'custom-polo-printing';

UPDATE products
SET
  options_schema = '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["1","5","10","25","50","100"],"required":true},{"name":"hoodie_color","label":"Hoodie Color","type":"select","options":["White","Black","Navy","Royal Blue","Red","Heather Gray"],"required":true},{"name":"print_location","label":"Print Location","type":"radio","options":["Front","Back","Front and Back"],"required":true},{"name":"size_breakdown","label":"Size Breakdown","type":"textarea","placeholder":"e.g. S:2, M:5, L:8, XL:3","required":false},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}'::jsonb,
  pricing_rules = jsonb_build_object('option_prices', jsonb_build_object(
    'quantity', jsonb_build_object('1', price, '5', round(price::numeric * 5, 2), '10', round(price::numeric * 10, 2), '25', round(price::numeric * 25, 2), '50', round(price::numeric * 50, 2), '100', round(price::numeric * 100, 2)),
    'hoodie_color', jsonb_build_object('White', 0, 'Black', 0, 'Navy', 0, 'Royal Blue', 0, 'Red', 0, 'Heather Gray', 0),
    'print_location', jsonb_build_object('Front', 0, 'Back', 0, 'Front and Back', 0)
  ))
WHERE slug = 'custom-hoodie-printing';

SELECT slug, category, options_schema, pricing_rules
FROM products
WHERE slug IN (
  'custom-t-shirt-printing',
  'custom-long-sleeve-t-shirt-printing',
  'custom-polo-printing',
  'custom-hoodie-printing'
)
ORDER BY slug;
