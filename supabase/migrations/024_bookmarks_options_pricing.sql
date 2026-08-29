-- Bookmarks: postcard-style stock/sides with bookmark sizes.
-- Keep this migration local until the current product-pricing batch is ready.

UPDATE products
SET
  options_schema = '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["250","500","1,000","2,500","5,000","10,000","Custom order"],"required":true},{"name":"size","label":"Size","type":"select","options":["1.5\" x 7\"","2.5\" x 8.5\"","2\" x 7\"","2\" x 8\"","2.75\" x 8.5\"","3\" x 4\"","3.5\" x 8.5\"","3.66\" x 4.25\"","8.5\" x 3.66\""],"required":true},{"name":"stock","label":"Stock","type":"select","options":["14pt C2S","16pt C2S"],"required":true},{"name":"sides","label":"Sides","type":"select","options":["Single Sided","Double Sided"],"required":true},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}'::jsonb,
  pricing_rules = jsonb_build_object(
    'option_prices',
    jsonb_build_object(
      'quantity', jsonb_build_object('250', 33.99, '500', 39.99, '1,000', 53.99, '2,500', 79.98, '5,000', 111.97, '10,000', 159.96, 'Custom order', 0),
      'size', jsonb_build_object('1.5" x 7"', 0, '2.5" x 8.5"', 0, '2" x 7"', 0, '2" x 8"', 0, '2.75" x 8.5"', 0, '3" x 4"', 0, '3.5" x 8.5"', 0, '3.66" x 4.25"', 0, '8.5" x 3.66"', 0),
      'stock', jsonb_build_object('14pt C2S', 0, '16pt C2S', 3),
      'sides', jsonb_build_object('Single Sided', 0, 'Double Sided', 5)
    )
  )
WHERE slug = 'bookmarks';

SELECT slug, options_schema, pricing_rules FROM products WHERE slug = 'bookmarks';
