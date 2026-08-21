-- Remove "Premium" prefix from specialty business card product titles

UPDATE products SET title = 'Metallic Foil Business Cards'
WHERE slug = 'business-cards-premium-metallic-foil-raised';

UPDATE products SET title = 'Kraft Paper Business Cards'
WHERE slug = 'business-cards-premium-kraft-paper';

UPDATE products SET title = 'Durable Business Cards'
WHERE slug = 'business-cards-premium-durable';

UPDATE products SET title = 'Spot UV Business Cards'
WHERE slug = 'business-cards-premium-spot-uv-raised';

UPDATE products SET title = 'Soft Touch Business Cards'
WHERE slug = 'business-cards-premium-soft-touch-suede';

UPDATE products SET title = '32pt Painted Edge Business Cards'
WHERE slug = 'business-cards-premium-32pt-painted-edge';
