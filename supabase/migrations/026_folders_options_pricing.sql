-- Folders: quantity, pockets, and design help only.

UPDATE products
SET
  options_schema = '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["250","500","1,000","2,500","5,000","10,000","Custom order"],"required":true},{"name":"pockets","label":"Pockets","type":"radio","options":["Yes","No"],"required":true},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}'::jsonb,
  pricing_rules = jsonb_build_object('option_prices', jsonb_build_object(
    'quantity', jsonb_build_object('250', 99.99, '500', 117.64, '1,000', 158.81, '2,500', 235.27, '5,000', 329.38, '10,000', 470.54, 'Custom order', 0),
    'pockets', jsonb_build_object('Yes', 0, 'No', 0)
  ))
WHERE slug = 'folders';

SELECT slug, options_schema, pricing_rules FROM products WHERE slug = 'folders';
