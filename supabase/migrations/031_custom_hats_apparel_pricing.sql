-- Custom Hats: trucker/baseball styles and option pricing for the Apparel tab.

UPDATE products
SET
  description = 'Custom embroidered or printed trucker hats and baseball caps for your brand.',
  options_schema = '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["12","24","48","72","144"],"required":true},{"name":"hat_style","label":"Hat Style","type":"select","options":["Trucker Hat","Baseball Cap"],"required":true},{"name":"hat_color","label":"Hat Color","type":"text","placeholder":"e.g. Black, Navy, Khaki","required":true},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}'::jsonb,
  pricing_rules = jsonb_build_object('option_prices', jsonb_build_object(
    'quantity', jsonb_build_object(
      '12', COALESCE(NULLIF(pricing_rules->'option_prices'->'quantity'->>'12', '')::numeric, price::numeric, 14.99),
      '24', COALESCE(NULLIF(pricing_rules->'option_prices'->'quantity'->>'24', '')::numeric, price::numeric * 2, 29.98),
      '48', COALESCE(NULLIF(pricing_rules->'option_prices'->'quantity'->>'48', '')::numeric, price::numeric * 4, 59.96),
      '72', COALESCE(NULLIF(pricing_rules->'option_prices'->'quantity'->>'72', '')::numeric, price::numeric * 6, 89.94),
      '144', COALESCE(NULLIF(pricing_rules->'option_prices'->'quantity'->>'144', '')::numeric, price::numeric * 12, 179.88)
    ),
    'hat_style', jsonb_build_object('Trucker Hat', 0, 'Baseball Cap', 0)
  ))
WHERE slug = 'custom-hats';

SELECT slug, category, options_schema, pricing_rules
FROM products
WHERE slug = 'custom-hats';
