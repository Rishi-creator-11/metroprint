-- Large Format category: move existing wide-format products and add Sinalite catalog items.

UPDATE products
SET category = 'Large Format'
WHERE slug IN ('roll-up-banners', 'car-door-magnets');

UPDATE products
SET
  options_schema = '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["250","500","1,000","2,500","5,000","10,000","Custom order"],"required":true},{"name":"banner_type","label":"Banner Type","type":"select","options":["13oz Matte Vinyl - Silver Base","13oz Matte Vinyl - Black Base","Premium Stand 13oz Matte Vinyl","Table Top 13oz Matte Vinyl","Premium Wide 13oz Matte Vinyl","Double Sided 13oz Matte Vinyl"],"required":true},{"name":"size","label":"Size","type":"select","options":["33\" x 81\""],"required":true},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}'::jsonb,
  pricing_rules = jsonb_build_object('option_prices', jsonb_build_object(
    'quantity', jsonb_build_object('250', 89, '500', 104.71, '1,000', 141.35, '2,500', 209.41, '5,000', 293.18, '10,000', 418.82, 'Custom order', 0),
    'banner_type', jsonb_build_object(
      '13oz Matte Vinyl - Silver Base', 0,
      '13oz Matte Vinyl - Black Base', 0,
      'Premium Stand 13oz Matte Vinyl', 0,
      'Table Top 13oz Matte Vinyl', 0,
      'Premium Wide 13oz Matte Vinyl', 0,
      'Double Sided 13oz Matte Vinyl', 0
    ),
    'size', jsonb_build_object('33" x 81"', 0)
  ))
WHERE slug = 'roll-up-banners';

INSERT INTO products (title, slug, category, description, base_price_text, image_url, options_schema, active, price, pricing_rules)
VALUES
  (
    'Coroplast Signs & Yard Signs',
    'coroplast-signs',
    'Large Format',
    'Durable coroplast signs — a great option for outdoor yard signage and campaigns.',
    'Starting at $19/sign',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
    '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["250","500","1,000","2,500","5,000","10,000","Custom order"],"required":true},{"name":"material","label":"Material","type":"select","options":["4mm Coroplast (Yard signs)","6mm Coroplast","8mm Coroplast","10mm Coroplast"],"required":true},{"name":"size","label":"Size","type":"select","options":["12\" x 18\"","18\" x 24\"","24\" x 36\"","36\" x 48\"","48\" x 96\""],"required":true},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}'::jsonb,
    true,
    19.99,
    '{"option_prices":{"quantity":{"250":19.99,"500":23.52,"1,000":31.79,"2,500":47.06,"5,000":65.88,"10,000":94.12,"Custom order":0},"material":{"4mm Coroplast (Yard signs)":0,"6mm Coroplast":0,"8mm Coroplast":0,"10mm Coroplast":0},"size":{"12\" x 18\"":0,"18\" x 24\"":0,"24\" x 36\"":0,"36\" x 48\"":0,"48\" x 96\"":0}}}'::jsonb
  ),
  (
    'Floor Graphics',
    'floor-graphics',
    'Large Format',
    'Removable vinyl floor graphics that are safe, long-lasting, and ideal for retail or events.',
    'Starting at $29/graphic',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
    '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["250","500","1,000","2,500","5,000","10,000","Custom order"],"required":true},{"name":"graphic_type","label":"Graphic Type","type":"select","options":["Floor Graphics","Social Distancing Floor Graphics"],"required":true},{"name":"size","label":"Size","type":"select","options":["12\" x 12\"","18\" x 18\"","24\" x 24\"","36\" x 36\"","48\" x 48\""],"required":true},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}'::jsonb,
    true,
    29.99,
    '{"option_prices":{"quantity":{"250":29.99,"500":35.28,"1,000":47.69,"2,500":70.58,"5,000":98.81,"10,000":141.16,"Custom order":0},"graphic_type":{"Floor Graphics":0,"Social Distancing Floor Graphics":0},"size":{"12\" x 12\"":0,"18\" x 18\"":0,"24\" x 24\"":0,"36\" x 36\"":0,"48\" x 48\"":0}}}'::jsonb
  ),
  (
    'Foam Board',
    'foam-board',
    'Large Format',
    'Lightweight foam board signs ideal for indoor displays and events.',
    'Starting at $24/sign',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
    '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["250","500","1,000","2,500","5,000","10,000","Custom order"],"required":true},{"name":"material","label":"Material","type":"select","options":["4mm Foam Board"],"required":true},{"name":"size","label":"Size","type":"select","options":["12\" x 18\"","18\" x 24\"","24\" x 36\"","36\" x 48\"","48\" x 96\""],"required":true},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}'::jsonb,
    true,
    24.99,
    '{"option_prices":{"quantity":{"250":24.99,"500":29.4,"1,000":39.69,"2,500":58.8,"5,000":82.32,"10,000":117.6,"Custom order":0},"material":{"4mm Foam Board":0},"size":{"12\" x 18\"":0,"18\" x 24\"":0,"24\" x 36\"":0,"36\" x 48\"":0,"48\" x 96\"":0}}}'::jsonb
  ),
  (
    'Aluminum Signs',
    'aluminum-signs',
    'Large Format',
    'Durable metal signage perfect for outdoor use and long-term branding.',
    'Starting at $49/sign',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
    '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["250","500","1,000","2,500","5,000","10,000","Custom order"],"required":true},{"name":"material","label":"Material","type":"select","options":["3mm Aluminum Signs"],"required":true},{"name":"size","label":"Size","type":"select","options":["12\" x 18\"","18\" x 24\"","24\" x 36\"","36\" x 48\"","48\" x 96\""],"required":true},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}'::jsonb,
    true,
    49.99,
    '{"option_prices":{"quantity":{"250":49.99,"500":58.81,"1,000":79.4,"2,500":117.62,"5,000":164.67,"10,000":235.25,"Custom order":0},"material":{"3mm Aluminum Signs":0},"size":{"12\" x 18\"":0,"18\" x 24\"":0,"24\" x 36\"":0,"36\" x 48\"":0,"48\" x 96\"":0}}}'::jsonb
  ),
  (
    'Banners',
    'banners',
    'Large Format',
    'Vinyl and mesh banners — a cost-effective, portable way to communicate your message.',
    'Starting at $39/banner',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
    '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["250","500","1,000","2,500","5,000","10,000","Custom order"],"required":true},{"name":"material","label":"Material","type":"select","options":["13oz Glossy Vinyl","13oz Matte Vinyl","8oz Polyester Mesh"],"required":true},{"name":"size","label":"Size","type":"select","options":["2'' x 4''","3'' x 6''","4'' x 8''","5'' x 10''"],"required":true},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}'::jsonb,
    true,
    39.99,
    '{"option_prices":{"quantity":{"250":39.99,"500":47.05,"1,000":63.49,"2,500":94.1,"5,000":131.74,"10,000":188.2,"Custom order":0},"material":{"13oz Glossy Vinyl":0,"13oz Matte Vinyl":0,"8oz Polyester Mesh":0},"size":{"2'' x 4''":0,"3'' x 6''":0,"4'' x 8''":0,"5'' x 10''":0}}}'::jsonb
  ),
  (
    'Table Covers',
    'table-covers',
    'Large Format',
    'Custom table covers for 6'' or 8'' tables at trade shows, conventions, and events.',
    'Starting at $129/cover',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
    '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["250","500","1,000","2,500","5,000","10,000","Custom order"],"required":true},{"name":"table_size","label":"Table Size","type":"select","options":["Table Covers (6 ft Table)","Table Covers (8 ft Table)"],"required":true},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}'::jsonb,
    true,
    129.99,
    '{"option_prices":{"quantity":{"250":129.99,"500":152.93,"1,000":206.35,"2,500":305.86,"5,000":428.2,"10,000":611.72,"Custom order":0},"table_size":{"Table Covers (6 ft Table)":0,"Table Covers (8 ft Table)":0}}}'::jsonb
  ),
  (
    'Adhesive Vinyl',
    'adhesive-vinyl',
    'Large Format',
    'Glossy adhesive vinyl for POP displays, trade show graphics, and permanent wall applications.',
    'Starting at $34/sq ft',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
    '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["250","500","1,000","2,500","5,000","10,000","Custom order"],"required":true},{"name":"material","label":"Material","type":"select","options":["Glossy Adhesive Vinyl"],"required":true},{"name":"size","label":"Size","type":"select","options":["12\" x 18\"","18\" x 24\"","24\" x 36\"","36\" x 48\"","48\" x 96\""],"required":true},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}'::jsonb,
    true,
    34.99,
    '{"option_prices":{"quantity":{"250":34.99,"500":41.16,"1,000":55.57,"2,500":82.32,"5,000":115.25,"10,000":164.64,"Custom order":0},"material":{"Glossy Adhesive Vinyl":0},"size":{"12\" x 18\"":0,"18\" x 24\"":0,"24\" x 36\"":0,"36\" x 48\"":0,"48\" x 96\"":0}}}'::jsonb
  ),
  (
    'Window Graphics',
    'window-graphics',
    'Large Format',
    'Perforated vinyl window graphics to enhance storefronts and stand out with your message.',
    'Starting at $39/graphic',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
    '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["250","500","1,000","2,500","5,000","10,000","Custom order"],"required":true},{"name":"material","label":"Material","type":"select","options":["Perforated Vinyl"],"required":true},{"name":"size","label":"Size","type":"select","options":["12\" x 18\"","18\" x 24\"","24\" x 36\"","36\" x 48\"","48\" x 96\""],"required":true},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}'::jsonb,
    true,
    39.99,
    '{"option_prices":{"quantity":{"250":39.99,"500":47.05,"1,000":63.49,"2,500":94.1,"5,000":131.74,"10,000":188.2,"Custom order":0},"material":{"Perforated Vinyl":0},"size":{"12\" x 18\"":0,"18\" x 24\"":0,"24\" x 36\"":0,"36\" x 48\"":0,"48\" x 96\"":0}}}'::jsonb
  ),
  (
    'Large Format Posters',
    'large-format-posters',
    'Large Format',
    'Large format posters printed on semi-gloss card stock for retail, events, and advertising.',
    'Starting at $29/poster',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop',
    '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["250","500","1,000","2,500","5,000","10,000","Custom order"],"required":true},{"name":"material","label":"Material","type":"select","options":["8pt C2S"],"required":true},{"name":"size","label":"Size","type":"select","options":["18\" x 24\"","24\" x 36\"","36\" x 48\""],"required":true},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}'::jsonb,
    true,
    29.99,
    '{"option_prices":{"quantity":{"250":29.99,"500":35.28,"1,000":47.69,"2,500":70.58,"5,000":98.81,"10,000":141.16,"Custom order":0},"material":{"8pt C2S":0},"size":{"18\" x 24\"":0,"24\" x 36\"":0,"36\" x 48\"":0}}}'::jsonb
  ),
  (
    'Styrene Signs',
    'styrene-signs',
    'Large Format',
    'Lightweight yet durable PVC styrene sheets for indoor and outdoor signage.',
    'Starting at $34/sign',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
    '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["250","500","1,000","2,500","5,000","10,000","Custom order"],"required":true},{"name":"material","label":"Material","type":"select","options":["20pt Styrene"],"required":true},{"name":"size","label":"Size","type":"select","options":["12\" x 18\"","18\" x 24\"","24\" x 36\"","36\" x 48\"","48\" x 96\""],"required":true},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}'::jsonb,
    true,
    34.99,
    '{"option_prices":{"quantity":{"250":34.99,"500":41.16,"1,000":55.57,"2,500":82.32,"5,000":115.25,"10,000":164.64,"Custom order":0},"material":{"20pt Styrene":0},"size":{"12\" x 18\"":0,"18\" x 24\"":0,"24\" x 36\"":0,"36\" x 48\"":0,"48\" x 96\"":0}}}'::jsonb
  ),
  (
    'Display Board / POP',
    'display-board-pop',
    'Large Format',
    'Thick semi-gloss display board for posters, signage, and point-of-purchase advertising.',
    'Starting at $44/sign',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
    '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["250","500","1,000","2,500","5,000","10,000","Custom order"],"required":true},{"name":"material","label":"Material","type":"select","options":["24pt Display Board","40pt Display Board"],"required":true},{"name":"size","label":"Size","type":"select","options":["12\" x 18\"","18\" x 24\"","24\" x 36\"","36\" x 48\"","48\" x 96\""],"required":true},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}'::jsonb,
    true,
    44.99,
    '{"option_prices":{"quantity":{"250":44.99,"500":52.93,"1,000":71.49,"2,500":105.86,"5,000":148.2,"10,000":211.72,"Custom order":0},"material":{"24pt Display Board":0,"40pt Display Board":0},"size":{"12\" x 18\"":0,"18\" x 24\"":0,"24\" x 36\"":0,"36\" x 48\"":0,"48\" x 96\"":0}}}'::jsonb
  ),
  (
    'Canvas',
    'canvas-prints',
    'Large Format',
    'Canvas rolls and stretched canvas prints for photography, art, and décor.',
    'Starting at $59/print',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
    '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["250","500","1,000","2,500","5,000","10,000","Custom order"],"required":true},{"name":"canvas_type","label":"Canvas Type","type":"select","options":["Canvas Roll","Stretched Canvas Prints"],"required":true},{"name":"size","label":"Size","type":"select","options":["16\" x 20\"","18\" x 24\"","24\" x 36\"","30\" x 40\"","36\" x 48\""],"required":true},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}'::jsonb,
    true,
    59.99,
    '{"option_prices":{"quantity":{"250":59.99,"500":70.58,"1,000":95.29,"2,500":141.16,"5,000":197.62,"10,000":282.32,"Custom order":0},"canvas_type":{"Canvas Roll":0,"Stretched Canvas Prints":0},"size":{"16\" x 20\"":0,"18\" x 24\"":0,"24\" x 36\"":0,"30\" x 40\"":0,"36\" x 48\"":0}}}'::jsonb
  ),
  (
    'Sintra / PVC',
    'sintra-pvc',
    'Large Format',
    'Lightweight, durable Sintra PVC — an excellent choice for outdoor signage.',
    'Starting at $39/sign',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
    '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["250","500","1,000","2,500","5,000","10,000","Custom order"],"required":true},{"name":"material","label":"Material","type":"select","options":["3mm PVC"],"required":true},{"name":"size","label":"Size","type":"select","options":["12\" x 18\"","18\" x 24\"","24\" x 36\"","36\" x 48\"","48\" x 96\""],"required":true},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}'::jsonb,
    true,
    39.99,
    '{"option_prices":{"quantity":{"250":39.99,"500":47.05,"1,000":63.49,"2,500":94.1,"5,000":131.74,"10,000":188.2,"Custom order":0},"material":{"3mm PVC":0},"size":{"12\" x 18\"":0,"18\" x 24\"":0,"24\" x 36\"":0,"36\" x 48\"":0,"48\" x 96\"":0}}}'::jsonb
  ),
  (
    'X-Frame Banners',
    'x-frame-banners',
    'Large Format',
    'X-frame banner displays for events, trade shows, and in-store promotions.',
    'Starting at $79/banner',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
    '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["250","500","1,000","2,500","5,000","10,000","Custom order"],"required":true},{"name":"material","label":"Material","type":"select","options":["13oz Matte Vinyl"],"required":true},{"name":"size","label":"Size","type":"select","options":["24\" x 63\"","32\" x 71\"","33\" x 81\""],"required":true},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}'::jsonb,
    true,
    79.99,
    '{"option_prices":{"quantity":{"250":79.99,"500":94.11,"1,000":127.09,"2,500":188.22,"5,000":263.51,"10,000":376.44,"Custom order":0},"material":{"13oz Matte Vinyl":0},"size":{"24\" x 63\"":0,"32\" x 71\"":0,"33\" x 81\"":0}}}'::jsonb
  ),
  (
    'A-Frame Signs',
    'a-frame-signs',
    'Large Format',
    'Portable A-frame coroplast signs that capture attention from passing customers.',
    'Starting at $49/sign',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
    '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["250","500","1,000","2,500","5,000","10,000","Custom order"],"required":true},{"name":"material","label":"Material","type":"select","options":["4mm Coroplast"],"required":true},{"name":"size","label":"Size","type":"select","options":["18\" x 24\"","24\" x 36\""],"required":true},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}'::jsonb,
    true,
    49.99,
    '{"option_prices":{"quantity":{"250":49.99,"500":58.81,"1,000":79.4,"2,500":117.62,"5,000":164.67,"10,000":235.25,"Custom order":0},"material":{"4mm Coroplast":0},"size":{"18\" x 24\"":0,"24\" x 36\"":0}}}'::jsonb
  ),
  (
    'Wall Decals',
    'wall-decals',
    'Large Format',
    'Removable vinyl wall decals for custom interior branding and décor.',
    'Starting at $29/decal',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
    '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["250","500","1,000","2,500","5,000","10,000","Custom order"],"required":true},{"name":"material","label":"Material","type":"select","options":["7 mil Removable Wall Decal"],"required":true},{"name":"size","label":"Size","type":"select","options":["12\" x 18\"","18\" x 24\"","24\" x 36\"","36\" x 48\"","48\" x 96\""],"required":true},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}'::jsonb,
    true,
    29.99,
    '{"option_prices":{"quantity":{"250":29.99,"500":35.28,"1,000":47.69,"2,500":70.58,"5,000":98.81,"10,000":141.16,"Custom order":0},"material":{"7 mil Removable Wall Decal":0},"size":{"12\" x 18\"":0,"18\" x 24\"":0,"24\" x 36\"":0,"36\" x 48\"":0,"48\" x 96\"":0}}}'::jsonb
  ),
  (
    'A Frame Stands',
    'a-frame-stands',
    'Large Format',
    'A-frame stands that hold signs on both sides for bidirectional promotions.',
    'Starting at $89/stand',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
    '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["250","500","1,000","2,500","5,000","10,000","Custom order"],"required":true},{"name":"stand_type","label":"Stand Type","type":"select","options":["A Frame Stands"],"required":true},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}'::jsonb,
    true,
    89.99,
    '{"option_prices":{"quantity":{"250":89.99,"500":105.87,"1,000":142.94,"2,500":211.74,"5,000":296.44,"10,000":423.48,"Custom order":0},"stand_type":{"A Frame Stands":0}}}'::jsonb
  ),
  (
    'H Stands for Signs',
    'h-stands',
    'Large Format',
    'H-stands to keep coroplast yard signs upright on lawns and sidewalks.',
    'Starting at $12/stand',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
    '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["250","500","1,000","2,500","5,000","10,000","Custom order"],"required":true},{"name":"stand_type","label":"Stand Type","type":"select","options":["H Stands"],"required":true},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}'::jsonb,
    true,
    12.99,
    '{"option_prices":{"quantity":{"250":12.99,"500":15.28,"1,000":20.64,"2,500":30.56,"5,000":42.78,"10,000":61.12,"Custom order":0},"stand_type":{"H Stands":0}}}'::jsonb
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  base_price_text = EXCLUDED.base_price_text,
  image_url = EXCLUDED.image_url,
  options_schema = EXCLUDED.options_schema,
  active = EXCLUDED.active,
  price = EXCLUDED.price,
  pricing_rules = EXCLUDED.pricing_rules;

SELECT slug, category FROM products WHERE category = 'Large Format' ORDER BY title;
