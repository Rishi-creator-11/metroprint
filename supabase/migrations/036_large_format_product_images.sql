-- Product mockup images (stored in public/images/products/large-format/).

UPDATE products SET image_url = '/images/products/large-format/coroplast-signs.jpg' WHERE slug = 'coroplast-signs';
UPDATE products SET image_url = '/images/products/large-format/floor-graphics.png' WHERE slug = 'floor-graphics';
UPDATE products SET image_url = '/images/products/large-format/foam-board.jpg' WHERE slug = 'foam-board';
UPDATE products SET image_url = '/images/products/large-format/aluminum-signs.png' WHERE slug = 'aluminum-signs';
UPDATE products SET image_url = '/images/products/large-format/banners.png' WHERE slug = 'banners';
UPDATE products SET image_url = '/images/products/large-format/roll-up-banners.png' WHERE slug = 'roll-up-banners';
UPDATE products SET image_url = '/images/products/large-format/car-door-magnets.jpg' WHERE slug = 'car-door-magnets';
UPDATE products SET image_url = '/images/products/large-format/table-covers.png' WHERE slug = 'table-covers';
UPDATE products SET image_url = '/images/products/large-format/adhesive-vinyl.png' WHERE slug = 'adhesive-vinyl';
UPDATE products SET image_url = '/images/products/large-format/window-graphics.jpg' WHERE slug = 'window-graphics';
UPDATE products SET image_url = '/images/products/large-format/large-format-posters.jpg' WHERE slug = 'large-format-posters';
UPDATE products SET image_url = '/images/products/large-format/styrene-signs.jpg' WHERE slug = 'styrene-signs';
UPDATE products SET image_url = '/images/products/large-format/display-board-pop.jpg' WHERE slug = 'display-board-pop';
UPDATE products SET image_url = '/images/products/large-format/canvas-prints.jpg' WHERE slug = 'canvas-prints';
UPDATE products SET image_url = '/images/products/large-format/sintra-pvc.jpg' WHERE slug = 'sintra-pvc';
UPDATE products SET image_url = '/images/products/large-format/x-frame-banners.jpg' WHERE slug = 'x-frame-banners';
UPDATE products SET image_url = '/images/products/large-format/a-frame-signs.jpg' WHERE slug = 'a-frame-signs';
UPDATE products SET image_url = '/images/products/large-format/wall-decals.png' WHERE slug = 'wall-decals';
UPDATE products SET image_url = '/images/products/large-format/a-frame-stands.jpg' WHERE slug = 'a-frame-stands';
UPDATE products SET image_url = '/images/products/large-format/h-stands.jpg' WHERE slug = 'h-stands';

SELECT slug, image_url FROM products WHERE category = 'Large Format' ORDER BY title;
