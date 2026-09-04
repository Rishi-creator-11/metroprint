-- One-time reconciliation so Supabase is authoritative for product content.
-- Every other option-priced product row already matches the code; only the two
-- wide-format products that moved to "Large Format" still carry stale values
-- (migration 035 was never applied). This aligns just those two so the
-- storefront no longer needs a seed override for identity/schema.

UPDATE products
SET category = 'Large Format'
WHERE slug IN ('roll-up-banners', 'car-door-magnets') AND category <> 'Large Format';

UPDATE products
SET
  title = 'Pull Up Banners',
  description = 'Portable pull-up banners for trade shows, events, and retail displays.',
  base_price_text = 'Starting at $89/banner',
  image_url = '/images/products/large-format/roll-up-banners.png',
  options_schema = '{"fields":[
    {"name":"quantity","label":"Quantity","type":"select","options":["250","500","1,000","2,500","5,000","10,000","Custom order"],"required":true},
    {"name":"banner_type","label":"Banner Type","type":"select","options":["13oz Matte Vinyl - Silver Base","13oz Matte Vinyl - Black Base","Premium Stand 13oz Matte Vinyl","Table Top 13oz Matte Vinyl","Premium Wide 13oz Matte Vinyl","Double Sided 13oz Matte Vinyl"],"required":true},
    {"name":"size","label":"Size","type":"select","options":["33\" x 81\""],"required":true},
    {"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}
  ]}'::jsonb,
  pricing_rules = jsonb_set(
    COALESCE(pricing_rules, '{"option_prices":{}}'::jsonb),
    '{option_prices,banner_type}',
    '{"13oz Matte Vinyl - Silver Base":0,"13oz Matte Vinyl - Black Base":0,"Premium Stand 13oz Matte Vinyl":0,"Table Top 13oz Matte Vinyl":0,"Premium Wide 13oz Matte Vinyl":0,"Double Sided 13oz Matte Vinyl":0}'::jsonb,
    true
  ) #- '{option_prices,metal_stand}'
WHERE slug = 'roll-up-banners';

UPDATE products
SET
  title = 'Car Magnets',
  description = 'Thick removable car door magnets for fleet branding and local business advertising.',
  image_url = '/images/products/large-format/car-door-magnets.jpg'
WHERE slug = 'car-door-magnets';
