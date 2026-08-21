-- Fold-over business cards: size and finish options

UPDATE products
SET
  title = 'Fold-over Business Cards',
  description = 'Fold-over business cards that open to reveal extra space for your message, logo, or offer — MetroPrint USA (MKT1).',
  base_price_text = 'Starting at $37/100',
  options_schema = '{"fields":[{"name":"quantity","label":"Quantity","type":"select","options":["25","50","100","250","500","1000","2500"],"required":true},{"name":"size","label":"Size","type":"select","options":["2\" x 7\"","3.5\" x 4\""],"required":true},{"name":"finish","label":"Finish","type":"select","options":["Matte","UV Gloss","Soft Touch"],"required":true},{"name":"need_design_help","label":"Need Design Help","type":"radio","options":["Yes","No"],"required":true}]}'
WHERE slug = 'business-cards-specialty-fold-over';
