-- Roll-Up Banners: 33x81 size and standard/premium metal stand.

UPDATE products
SET
  options_schema = '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["250","500","1,000","2,500","5,000","10,000","Custom order"],"required":true},{"name":"size","label":"Size","type":"select","options":["33\" x 81\""],"required":true},{"name":"metal_stand","label":"Include Metal Stand","type":"radio","options":["Standard","Premium"],"required":true},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}'::jsonb,
  pricing_rules = jsonb_build_object('option_prices', jsonb_build_object(
    'quantity', jsonb_build_object('250', 89, '500', 104.71, '1,000', 141.35, '2,500', 209.41, '5,000', 293.18, '10,000', 418.82, 'Custom order', 0),
    'size', jsonb_build_object('33" x 81"', 0),
    'metal_stand', jsonb_build_object('Standard', 0, 'Premium', 0)
  ))
WHERE slug = 'roll-up-banners';

SELECT slug, options_schema, pricing_rules FROM products WHERE slug = 'roll-up-banners';
