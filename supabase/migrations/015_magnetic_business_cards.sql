-- Magnetic business cards: shape options; remove "Specialty" from titles

UPDATE products
SET
  title = 'Magnetic Business Cards',
  description = 'Magnetic business cards that stick to fridges, filing cabinets, and metal surfaces — MetroPrint USA (MKT1).',
  base_price_text = 'Starting at $40/100',
  options_schema = '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["25","50","100","250","500","1000","2500"],"required":true},{"name":"size","label":"Size","type":"select","options":["2\" x 3.5\""],"required":true},{"name":"shape","label":"Shape","type":"select","options":["Rounded 4 Corners","Rectangle","Oval"],"required":true},{"name":"corner_radius","label":"Radius of Corners","type":"select","options":["1/8\"","3/16\"","1/4\"","N/A (Rectangle or Oval)"],"required":true},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}'
WHERE slug = 'business-cards-specialty-magnetic';

UPDATE products SET title = 'Fold-over Business Cards'
WHERE slug = 'business-cards-specialty-fold-over' AND title ILIKE '%Specialty%';

UPDATE products SET title = 'Plastic Business Cards'
WHERE slug = 'business-cards-specialty-plastic' AND title ILIKE '%Specialty%';
