-- Folders: add catalog sizes and business-card slit choices.

UPDATE products
SET
  options_schema = '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["250","500","1,000","2,500","5,000","10,000","Custom order"],"required":true},{"name":"size","label":"Size","type":"select","options":["5.25\" x 10.5\"","6\" x 9\"","9\" x 12\" - 3 inch Pocket","9\" x 12\" - 4 inch Pocket","9\" x 14.5\" - 3 inch Pocket","9\" x 14.5\" - 4 inch Pocket"],"required":true},{"name":"pockets","label":"Pockets","type":"radio","options":["Yes","No"],"required":true},{"name":"business_card_slit","label":"Business Card Slit","type":"select","options":["None","Right Side","Left Side","Both Sides"],"required":true},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}'::jsonb,
  pricing_rules = jsonb_build_object('option_prices', jsonb_build_object(
    'quantity', COALESCE(pricing_rules->'option_prices'->'quantity', '{}'::jsonb),
    'size', jsonb_build_object(
      '5.25" x 10.5"', 0,
      '6" x 9"', 0,
      '9" x 12" - 3 inch Pocket', 0,
      '9" x 12" - 4 inch Pocket', 0,
      '9" x 14.5" - 3 inch Pocket', 0,
      '9" x 14.5" - 4 inch Pocket', 0
    ),
    'pockets', COALESCE(pricing_rules->'option_prices'->'pockets', jsonb_build_object('Yes', 0, 'No', 0)),
    'business_card_slit', jsonb_build_object('None', 0, 'Right Side', 0, 'Left Side', 0, 'Both Sides', 0)
  ))
WHERE slug = 'folders';

SELECT slug, options_schema, pricing_rules FROM products WHERE slug = 'folders';
