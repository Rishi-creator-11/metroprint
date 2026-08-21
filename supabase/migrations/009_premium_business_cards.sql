-- Premium business cards: reference-based specs, remove types without product pages

UPDATE products SET active = false
WHERE slug IN (
  'business-cards-premium-pearl-paper',
  'business-cards-premium-die-cut',
  'business-cards-premium-ultra-smooth'
);

-- Metallic Foil
INSERT INTO products (title, slug, category, description, base_price_text, image_url, options_schema, active, price) VALUES
(
  'Metallic Foil Business Cards',
  'business-cards-premium-metallic-foil-raised',
  'Business Cards',
  'Raised foil business cards with silver or gold custom foil printing. Premium look for high-end branding — MetroPrint USA (MKT1).',
  'Starting at $43/100',
  'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=600&fit=crop',
  '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["25","50","100","250","500","1000","2500"],"required":true},{"name":"size","label":"Size","type":"select","options":["3.5\" x 2\""],"required":true},{"name":"foil_color","label":"Foil Color","type":"select","options":["Gold metallic foil (front)","Silver metallic foil (front)","Gold metallic foil (both sides)","Silver metallic foil (both sides)"],"required":true},{"name":"corners","label":"Corners","type":"select","options":["Rectangle","Rounded"],"required":true},{"name":"sides","label":"Sides","type":"select","options":["Single Sided","Double Sided"],"required":true},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}',
  true,
  43.00
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description, base_price_text = EXCLUDED.base_price_text,
  options_schema = EXCLUDED.options_schema, active = EXCLUDED.active, price = EXCLUDED.price;

-- Kraft Paper
INSERT INTO products (title, slug, category, description, base_price_text, image_url, options_schema, active, price) VALUES
(
  'Kraft Paper Business Cards',
  'business-cards-premium-kraft-paper',
  'Business Cards',
  'Natural kraft business cards with a rustic, eco-friendly look. 100% recyclable — best for bold, dark-colored designs. MetroPrint USA (MKT1).',
  'Starting at $34/100',
  'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=600&fit=crop',
  '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["25","50","100","250","500","1000","2500"],"required":true},{"name":"size","label":"Size","type":"select","options":["3.5\" x 2\""],"required":true},{"name":"corners","label":"Corners","type":"select","options":["Rectangle","Rounded"],"required":true},{"name":"sides","label":"Sides","type":"select","options":["Single Sided","Double Sided"],"required":true},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}',
  true,
  11.61
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description, base_price_text = EXCLUDED.base_price_text,
  options_schema = EXCLUDED.options_schema, active = EXCLUDED.active, price = EXCLUDED.price;

-- Durable
INSERT INTO products (title, slug, category, description, base_price_text, image_url, options_schema, active, price) VALUES
(
  'Durable Business Cards',
  'business-cards-premium-durable',
  'Business Cards',
  'Waterproof and tear-resistant synthetic business cards. 100% recyclable and built to last in tough conditions — MetroPrint USA (MKT1).',
  'Starting at $34/100',
  'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=600&fit=crop',
  '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["25","50","100","250","500","1000","2500"],"required":true},{"name":"size","label":"Size","type":"select","options":["3.5\" x 2\""],"required":true},{"name":"corners","label":"Corners","type":"select","options":["Rectangle","Rounded"],"required":true},{"name":"sides","label":"Sides","type":"select","options":["Single Sided","Double Sided"],"required":true},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}',
  true,
  26.82
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description, base_price_text = EXCLUDED.base_price_text,
  options_schema = EXCLUDED.options_schema, active = EXCLUDED.active, price = EXCLUDED.price;

-- Spot UV
INSERT INTO products (title, slug, category, description, base_price_text, image_url, options_schema, active, price) VALUES
(
  'Spot UV Business Cards',
  'business-cards-premium-spot-uv-raised',
  'Business Cards',
  'Laminated business cards with raised clear spot UV gloss applied to areas of your choice. Adds tactile, premium detail — MetroPrint USA (MKT1).',
  'Starting at $44/100',
  'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=600&fit=crop',
  '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["25","50","100","250","500","1000","2500"],"required":true},{"name":"size","label":"Size","type":"select","options":["3.5\" x 2\""],"required":true},{"name":"spot_uv","label":"Spot UV","type":"select","options":["One sided","Both sides"],"required":true},{"name":"corners","label":"Corners","type":"select","options":["Rectangle","Rounded"],"required":true},{"name":"sides","label":"Sides","type":"select","options":["Single Sided","Double Sided"],"required":true},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}',
  true,
  43.93
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description, base_price_text = EXCLUDED.base_price_text,
  options_schema = EXCLUDED.options_schema, active = EXCLUDED.active, price = EXCLUDED.price;

-- Soft Touch
INSERT INTO products (title, slug, category, description, base_price_text, image_url, options_schema, active, price) VALUES
(
  'Soft Touch Business Cards',
  'business-cards-premium-soft-touch-suede',
  'Business Cards',
  'Soft touch (suede) business cards with a luxurious velvet-like surface. 19pt thickness with scratch and smudge protection — MetroPrint USA (MKT1).',
  'Starting at $27/25',
  'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=600&fit=crop',
  '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["25","50","100","250","500","1000","2500"],"required":true},{"name":"size","label":"Size","type":"select","options":["3.5\" x 2\""],"required":true},{"name":"corners","label":"Corners","type":"select","options":["Rectangle","Rounded"],"required":true},{"name":"sides","label":"Sides","type":"select","options":["Single Sided","Double Sided"],"required":true},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}',
  true,
  26.50
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description, base_price_text = EXCLUDED.base_price_text,
  options_schema = EXCLUDED.options_schema, active = EXCLUDED.active, price = EXCLUDED.price;

-- 32pt Painted Edge
INSERT INTO products (title, slug, category, description, base_price_text, image_url, options_schema, active, price) VALUES
(
  '32pt Painted Edge Business Cards',
  'business-cards-premium-32pt-painted-edge',
  'Business Cards',
  'Thick 32pt uncoated business cards with painted colored edges. Choose from popular edge colors for a bold first impression — MetroPrint USA (MKT1).',
  'Starting at $54/250',
  'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=600&fit=crop',
  '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["100","250","500","1000","2500"],"required":true},{"name":"size","label":"Size","type":"select","options":["3.5\" x 2\""],"required":true},{"name":"paint_color","label":"Edge Color","type":"select","options":["Metallic Yellow","Blue","Black","Yellow","Metallic Hot Pink","Metallic Green","Orange","Purple","Brown","Metallic Purple","Turquoise","Red","Metallic Blue","Pink","Metallic Gold","White (Not Painted)","Metallic Orange"],"required":true},{"name":"sides","label":"Sides","type":"select","options":["Single Sided","Double Sided"],"required":true},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}',
  true,
  53.65
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description, base_price_text = EXCLUDED.base_price_text,
  options_schema = EXCLUDED.options_schema, active = EXCLUDED.active, price = EXCLUDED.price;
