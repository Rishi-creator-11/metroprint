-- Painted edge business cards: full edge color list

UPDATE products
SET options_schema = '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["100","250","500","1000","2500"],"required":true},{"name":"size","label":"Size","type":"select","options":["3.5\" x 2\""],"required":true},{"name":"paint_color","label":"Edge Color","type":"select","options":["Metallic Yellow","Blue","Black","Yellow","Metallic Hot Pink","Metallic Green","Orange","Purple","Brown","Metallic Purple","Turquoise","Red","Metallic Blue","Pink","Metallic Gold","White (Not Painted)","Metallic Orange"],"required":true},{"name":"sides","label":"Sides","type":"select","options":["Single Sided","Double Sided"],"required":true},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}'
WHERE slug = 'business-cards-premium-32pt-painted-edge';
