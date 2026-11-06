-- ============================================================================
-- Mumtahina’s Closet Inc - Safe Data Purge Migration Script
-- Purpose: Permanently clear products and customer orders while preserving
--          all database tables, categories, users, admin accounts, and settings.
-- ============================================================================

START TRANSACTION;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Clear customer order line items
DELETE FROM `order_items`;

-- 2. Clear customer orders
DELETE FROM `orders`;

-- 3. Clear active and saved shopping cart items
DELETE FROM `cart_items`;

-- 4. Clear customer wishlists
DELETE FROM `wishlists`;

-- 5. Clear product reviews
DELETE FROM `reviews`;

-- 6. Clear all product catalog items
DELETE FROM `products`;

-- Re-enable foreign key constraints
SET FOREIGN_KEY_CHECKS = 1;

COMMIT;

-- Verification Queries (Run these to confirm all target tables are now 0):
-- SELECT 'products' AS `table`, COUNT(*) AS `count` FROM `products`
-- UNION ALL
-- SELECT 'orders', COUNT(*) FROM `orders`
-- UNION ALL
-- SELECT 'order_items', COUNT(*) FROM `order_items`
-- UNION ALL
-- SELECT 'cart_items', COUNT(*) FROM `cart_items`
-- UNION ALL
-- SELECT 'wishlists', COUNT(*) FROM `wishlists`
-- UNION ALL
-- SELECT 'reviews', COUNT(*) FROM `reviews`
-- UNION ALL
-- SELECT 'categories (preserved)', COUNT(*) FROM `categories`
-- UNION ALL
-- SELECT 'users (preserved)', COUNT(*) FROM `users`;
