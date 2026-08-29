-- Posters: standard quantity tiers; retain size and paper options.

UPDATE products
SET
  options_schema = '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["250","500","1,000","2,500","5,000","10,000","Custom order"],"required":true},{"name":"size","label":"Size","type":"select","options":["18\" x 24\"","24\" x 36\"","11\" x 17\""],"required":true},{"name":"paper_type","label":"Paper Type","type":"select","options":["Glossy","Matte","Satin"],"required":true},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}'::jsonb,
  pricing_rules = jsonb_build_object('option_prices', jsonb_build_object(
    'quantity', jsonb_build_object('250', 15, '500', 17.65, '1,000', 23.82, '2,500', 35.29, '5,000', 49.41, '10,000', 70.59, 'Custom order', 0),
    'size', jsonb_build_object('18" x 24"', 0, '24" x 36"', 0, '11" x 17"', 0),
    'paper_type', jsonb_build_object('Glossy', 0, 'Matte', 0, 'Satin', 0)
  ))
WHERE slug = 'posters';

SELECT slug, options_schema, pricing_rules FROM products WHERE slug = 'posters';
