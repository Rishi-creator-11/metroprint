-- Add Car Door Magnets to Print Materials with option pricing.

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
  'Car Door Magnets',
  'car-door-magnets',
  'Print Materials',
  'Custom removable car door magnets for business advertising, fleets, and local promotions.',
  'Starting at $49.99',
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop',
  '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["250","500","1,000","2,500","5,000","10,000","Custom order"],"required":true},{"name":"size","label":"Size","type":"select","options":["12\" x 18\"","12\" x 24\"","18\" x 24\"","18\" x 30\"","24\" x 24\"","24\" x 36\""],"required":true},{"name":"rounded_corners","label":"Rounded Corners","type":"radio","options":["Yes","No"],"required":true},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}'::jsonb,
  true,
  49.99,
  '{"option_prices":{"quantity":{"250":49.99,"500":58.81,"1,000":79.4,"2,500":117.62,"5,000":164.67,"10,000":235.25,"Custom order":0},"size":{"12\" x 18\"":0,"12\" x 24\"":0,"18\" x 24\"":0,"18\" x 30\"":0,"24\" x 24\"":0,"24\" x 36\"":0},"rounded_corners":{"Yes":0,"No":0}}}'::jsonb
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

SELECT slug, category, options_schema, pricing_rules
FROM products
WHERE slug = 'car-door-magnets';
