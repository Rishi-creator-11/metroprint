-- Door Hangers: postcard-style stock/sides with door-hanger sizes.
-- Keep this migration local until the current product-pricing batch is ready.

UPDATE products
SET
  options_schema = '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["250","500","1,000","2,500","5,000","10,000","Custom order"],"required":true},{"name":"size","label":"Size","type":"select","options":["4.25\" x 11\"","8.5\" x 3.5\""],"required":true},{"name":"stock","label":"Stock","type":"select","options":["14pt C2S","16pt C2S"],"required":true},{"name":"sides","label":"Sides","type":"select","options":["Single Sided","Double Sided"],"required":true},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}'::jsonb,
  pricing_rules = jsonb_build_object(
    'option_prices',
    jsonb_build_object(
      'quantity', jsonb_build_object('250', 50.99, '500', 59.99, '1,000', 80.99, '2,500', 119.98, '5,000', 167.97, '10,000', 239.96, 'Custom order', 0),
      'size', jsonb_build_object('4.25" x 11"', 0, '8.5" x 3.5"', 0),
      'stock', jsonb_build_object('14pt C2S', 0, '16pt C2S', 3),
      'sides', jsonb_build_object('Single Sided', 0, 'Double Sided', 5)
    )
  )
WHERE slug = 'door-hangers';

SELECT slug, options_schema, pricing_rules FROM products WHERE slug = 'door-hangers';
