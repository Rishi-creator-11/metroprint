-- Business Cards: retire legacy bc-* products + seed option_prices (one price per option value)

UPDATE products SET active = false WHERE slug LIKE 'bc-%';
UPDATE products SET active = true WHERE slug LIKE 'business-cards-%';

UPDATE products SET subcategory = 'Standard' WHERE slug = 'business-cards-standard';
UPDATE products SET subcategory = 'Premium' WHERE slug LIKE 'business-cards-premium-%';
UPDATE products SET subcategory = 'Custom' WHERE slug LIKE 'business-cards-specialty-%';

UPDATE products SET pricing_rules = CASE slug
  WHEN 'business-cards-standard' THEN
    '{"option_prices":{"quantity":{"50":16.49,"100":20.99,"250":25.49,"500":29.99,"1000":40.49,"2500":59.99,"5000":83.99},"stock":{"14pt":0,"16pt":5,"18pt":10},"finish":{"Matte":0,"UV Gloss":8},"corners":{"Rectangle":0,"Rounded":3},"sides":{"Single Sided":0,"Double Sided":5}}}'::jsonb
  WHEN 'business-cards-premium-metallic-foil-raised' THEN
    '{"option_prices":{"quantity":{"25":19.35,"50":24.05,"100":30.10,"250":36.55,"500":43.00,"1000":58.05,"2500":86.00},"size":{"3.5\" x 2\"":0},"foil_color":{"Gold metallic foil (front)":0,"Silver metallic foil (front)":0,"Gold metallic foil (both sides)":8,"Silver metallic foil (both sides)":8},"lamination":{"Matte Lamination 2 Sided":5,"Soft Touch Lamination 2 Sided":8},"corners":{"Rectangle":0,"Rounded":3},"sides":{"Single Sided":0,"Double Sided":6}}}'::jsonb
  WHEN 'business-cards-premium-kraft-paper' THEN
    '{"option_prices":{"quantity":{"25":8.13,"50":10.11,"100":12.67,"250":15.37,"500":18.07,"1000":24.39,"2500":36.14},"size":{"3.5\" x 2\"":0},"corners":{"Rectangle":0,"Rounded":3},"sides":{"Single Sided":0,"Double Sided":5}}}'::jsonb
  WHEN 'business-cards-premium-durable' THEN
    '{"option_prices":{"quantity":{"25":18.77,"50":23.33,"100":29.20,"250":35.46,"500":41.72,"1000":56.32,"2500":83.44},"size":{"3.5\" x 2\"":0},"corners":{"Rectangle":0,"Rounded":3},"sides":{"Single Sided":0,"Double Sided":5}}}'::jsonb
  WHEN 'business-cards-premium-spot-uv-raised' THEN
    '{"option_prices":{"quantity":{"25":19.77,"50":24.57,"100":30.75,"250":37.34,"500":43.93,"1000":59.31,"2500":87.86},"size":{"3.5\" x 2\"":0},"lamination":{"Matte Lamination 2 Sided":5,"Soft Touch Lamination 2 Sided":8},"spot_uv":{"One sided":0,"Both sides":10},"corners":{"Rectangle":0,"Rounded":3},"sides":{"Single Sided":0,"Double Sided":6}}}'::jsonb
  WHEN 'business-cards-premium-soft-touch-suede' THEN
    '{"option_prices":{"quantity":{"25":11.93,"50":14.83,"100":18.55,"250":22.53,"500":26.50,"1000":35.78,"2500":53.00},"size":{"3.5\" x 2\"":0},"corners":{"Rectangle":0,"Rounded":3},"sides":{"Single Sided":0,"Double Sided":5}}}'::jsonb
  WHEN 'business-cards-premium-32pt-painted-edge' THEN
    '{"option_prices":{"quantity":{"100":37.56,"250":53.65,"500":72.43,"1000":97.78,"2500":150.22},"size":{"3.5\" x 2\"":0},"paint_color":{"Metallic Yellow":3,"Blue":0,"Black":0,"Yellow":0,"Metallic Hot Pink":3,"Metallic Green":3,"Orange":0,"Purple":0,"Brown":0,"Metallic Purple":3,"Turquoise":0,"Red":0,"Metallic Blue":3,"Pink":0,"Metallic Gold":5,"White (Not Painted)":0,"Metallic Orange":3},"sides":{"Single Sided":0,"Double Sided":8}}}'::jsonb
  WHEN 'business-cards-specialty-fold-over' THEN
    '{"option_prices":{"quantity":{"25":16.65,"50":20.69,"100":25.89,"250":31.44,"500":36.99,"1000":49.94,"2500":73.98},"size":{"2\" x 7\"":0,"3.5\" x 4\"":5},"finish":{"Matte":0,"UV Gloss":8,"Soft Touch":12}}}'::jsonb
  WHEN 'business-cards-specialty-plastic' THEN
    '{"option_prices":{"quantity":{"25":15.75,"50":19.57,"100":24.49,"250":29.74,"500":34.99,"1000":47.24,"2500":69.98},"size":{"2\" x 3.5\"":0},"shape":{"Rounded 4 Corners":0,"Oval":5},"plastic_type":{"Clear Plastic":0,"Frosted Plastic":4,"White Plastic":2},"colorspec":{"4/0 (4 color front)":0,"4/4 (4 color both sides)":10}}}'::jsonb
  WHEN 'business-cards-specialty-magnetic' THEN
    '{"option_prices":{"quantity":{"25":18.00,"50":22.36,"100":27.99,"250":34.01,"500":39.99,"1000":53.99,"2500":79.98},"size":{"2\" x 3.5\"":0},"shape":{"Rounded 4 Corners":0,"Rectangle":0,"Oval":5},"corner_radius":{"1/8\"":0,"3/16\"":2,"1/4\"":3,"N/A (Rectangle or Oval)":0}}}'::jsonb
  ELSE pricing_rules
END
WHERE slug LIKE 'business-cards-%';
