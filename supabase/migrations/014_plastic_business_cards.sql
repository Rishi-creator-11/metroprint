-- Plastic business cards: shape and plastic type options

UPDATE products
SET
  title = 'Plastic Business Cards',
  description = 'Durable plastic business cards in clear, frosted, or white — choose oval or rounded corners. MetroPrint USA (MKT1).',
  base_price_text = 'Starting at $35/100',
  options_schema = '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["25","50","100","250","500","1000","2500"],"required":true},{"name":"size","label":"Size","type":"select","options":["2\" x 3.5\""],"required":true},{"name":"shape","label":"Shape","type":"select","options":["Rounded 4 Corners","Oval"],"required":true},{"name":"plastic_type","label":"Plastic Type","type":"select","options":["Clear Plastic","Frosted Plastic","White Plastic"],"required":true},{"name":"colorspec","label":"Color Spec","type":"select","options":["4/0 (4 color front)","4/4 (4 color both sides)"],"required":true},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}'
WHERE slug = 'business-cards-specialty-plastic';
