-- Store checkout prices in the database so owners can update without code changes
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2);

UPDATE products SET price = 18.99 WHERE slug = 'custom-t-shirt-printing';
UPDATE products SET price = 24.99 WHERE slug = 'custom-polo-printing';
UPDATE products SET price = 34.99 WHERE slug = 'custom-hoodie-printing';
UPDATE products SET price = 14.99 WHERE slug = 'custom-hats';
UPDATE products SET price = 12.99 WHERE slug = 'tote-bags';
UPDATE products SET price = 29.99 WHERE slug = 'business-cards';
UPDATE products SET price = 49.99 WHERE slug = 'flyers';
UPDATE products SET price = 89.99 WHERE slug = 'brochures';
UPDATE products SET price = 19.99 WHERE slug = 'posters';
UPDATE products SET price = 59.99 WHERE slug = 'door-hangers';
UPDATE products SET price = 39.99 WHERE slug = 'bookmarks';
UPDATE products SET price = 99.99 WHERE slug = 'folders';
UPDATE products SET price = 89.99 WHERE slug = 'roll-up-banners';
UPDATE products SET price = 11.99 WHERE slug = 'custom-mugs';
UPDATE products SET price = 16.99 WHERE slug = 'custom-tumblers';
UPDATE products SET price = 149.99 WHERE slug = 'branded-merchandise';
UPDATE products SET price = 24.99 WHERE slug = 'dtf-transfers';
UPDATE products SET price = 22.99 WHERE slug = 'custom-apparel-printing-dtf';
UPDATE products SET price = 75.00 WHERE slug = 'graphic-design-services';
UPDATE products SET price = 499.00 WHERE slug = 'branding';
UPDATE products SET price = 299.00 WHERE slug = 'social-media-management';
UPDATE products SET price = 999.00 WHERE slug = 'video-production';
UPDATE products SET price = 50.00 WHERE slug = 'content-creation';
