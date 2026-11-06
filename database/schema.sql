-- ============================================================================
-- Mumtahina’s Closet Inc - Hostinger MySQL Database Schema
-- Version: 1.0.0
-- Charset: utf8mb4 (Full Unicode support for Bengali & English modesty collections)
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- ----------------------------------------------------------------------------
-- 1. Table: users
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `photo_url` VARCHAR(500) DEFAULT NULL,
  `role` ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  `reset_token` VARCHAR(128) DEFAULT NULL,
  `reset_expires_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_email` (`email`),
  KEY `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. Table: categories
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` VARCHAR(64) NOT NULL,
  `slug` VARCHAR(100) NOT NULL,
  `name_en` VARCHAR(150) NOT NULL,
  `name_bn` VARCHAR(150) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `image` VARCHAR(500) NOT NULL,
  `item_count` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `status` VARCHAR(30) NOT NULL DEFAULT 'active',
  `featured` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_categories_slug` (`slug`),
  KEY `idx_categories_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. Table: products
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` VARCHAR(64) NOT NULL,
  `product_id` VARCHAR(64) DEFAULT NULL,
  `name` VARCHAR(200) NOT NULL,
  `subtitle` VARCHAR(255) DEFAULT NULL,
  `category` VARCHAR(50) NOT NULL,
  `category_label` VARCHAR(100) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `original_price` DECIMAL(10,2) DEFAULT NULL,
  `is_new` TINYINT(1) NOT NULL DEFAULT 0,
  `is_best_seller` TINYINT(1) NOT NULL DEFAULT 0,
  `is_sale` TINYINT(1) NOT NULL DEFAULT 0,
  `rating` DECIMAL(3,2) NOT NULL DEFAULT 5.00,
  `review_count` INT NOT NULL DEFAULT 0,
  `images` LONGTEXT NOT NULL COMMENT 'JSON array of image URLs',
  `colors` LONGTEXT DEFAULT NULL COMMENT 'JSON array of objects {name, hex}',
  `color_names` LONGTEXT DEFAULT NULL COMMENT 'JSON array of color name strings',
  `sizes` LONGTEXT DEFAULT NULL COMMENT 'JSON array of size strings',
  `description` TEXT NOT NULL,
  `features` LONGTEXT DEFAULT NULL COMMENT 'JSON array of bullet features',
  `fabric` VARCHAR(255) DEFAULT NULL,
  `care_instructions` VARCHAR(255) DEFAULT NULL,
  `stock` INT NOT NULL DEFAULT 10,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_products_category` (`category`),
  KEY `idx_products_active` (`is_active`),
  KEY `idx_products_price` (`price`),
  KEY `idx_products_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. Table: orders
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` VARCHAR(64) NOT NULL,
  `order_id` VARCHAR(64) NOT NULL,
  `customer_id` VARCHAR(64) NOT NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `customer_email` VARCHAR(191) NOT NULL,
  `customer_phone` VARCHAR(50) DEFAULT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `subtotal` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `shipping` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `discount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `tax` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'USD',
  `payment_method` VARCHAR(50) NOT NULL DEFAULT 'Zelle',
  `payment_status` ENUM('Pending', 'Paid', 'Failed', 'Refunded') NOT NULL DEFAULT 'Pending',
  `order_status` ENUM('Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'Pending',
  `transaction_reference` VARCHAR(150) NOT NULL COMMENT 'Mandatory Zelle transaction / confirmation number',
  `zelle_reference` VARCHAR(150) DEFAULT NULL,
  `tracking_number` VARCHAR(100) DEFAULT NULL,
  `carrier` VARCHAR(100) DEFAULT NULL,
  `estimated_delivery` VARCHAR(100) DEFAULT NULL,
  `shipping_address` LONGTEXT DEFAULT NULL COMMENT 'JSON formatted address object',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_orders_order_id` (`order_id`),
  KEY `idx_orders_customer_id` (`customer_id`),
  KEY `idx_orders_customer_email` (`customer_email`),
  KEY `idx_orders_payment_status` (`payment_status`),
  KEY `idx_orders_order_status` (`order_status`),
  KEY `idx_orders_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. Table: order_items
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `order_id` VARCHAR(64) NOT NULL,
  `product_id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `quantity` INT NOT NULL DEFAULT 1,
  `size` VARCHAR(50) NOT NULL,
  `color` VARCHAR(50) NOT NULL,
  `image` VARCHAR(500) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_items_order_id` (`order_id`),
  KEY `idx_order_items_product_id` (`product_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. Table: carts & cart_items
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `cart_items`;
CREATE TABLE `cart_items` (
  `id` VARCHAR(100) NOT NULL COMMENT 'Composite identifier or UUID',
  `user_id` VARCHAR(64) NOT NULL,
  `product_id` VARCHAR(64) NOT NULL,
  `selected_size` VARCHAR(50) NOT NULL,
  `selected_color` VARCHAR(50) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cart_items_user` (`user_id`),
  KEY `idx_cart_items_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 7. Table: wishlists
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `wishlists`;
CREATE TABLE `wishlists` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `product_id` VARCHAR(64) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_wishlists_user_product` (`user_id`, `product_id`),
  KEY `idx_wishlists_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 8. Table: reviews
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` VARCHAR(64) NOT NULL,
  `product_id` VARCHAR(64) DEFAULT NULL,
  `customer_id` VARCHAR(64) DEFAULT NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `user_name` VARCHAR(150) DEFAULT NULL,
  `rating` DECIMAL(2,1) NOT NULL DEFAULT 5.0,
  `title` VARCHAR(255) DEFAULT NULL,
  `comment` TEXT NOT NULL,
  `verified` TINYINT(1) NOT NULL DEFAULT 1,
  `fit_feedback` VARCHAR(100) DEFAULT NULL,
  `status` ENUM('approved', 'pending', 'rejected') NOT NULL DEFAULT 'approved',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reviews_product_id` (`product_id`),
  KEY `idx_reviews_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 9. Table: inquiries
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `inquiries`;
CREATE TABLE `inquiries` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `customer_name` VARCHAR(150) DEFAULT NULL,
  `email` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `subject` VARCHAR(200) NOT NULL,
  `type` VARCHAR(100) DEFAULT NULL,
  `message` TEXT NOT NULL,
  `status` ENUM('New', 'In Review', 'Resolved') NOT NULL DEFAULT 'New',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_inquiries_email` (`email`),
  KEY `idx_inquiries_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 10. Table: shipping_addresses
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `shipping_addresses`;
CREATE TABLE `shipping_addresses` (
  `id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `title` VARCHAR(100) NOT NULL DEFAULT 'Home',
  `street` VARCHAR(255) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `state` VARCHAR(50) NOT NULL DEFAULT 'TX',
  `zip` VARCHAR(20) NOT NULL,
  `is_default` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_shipping_addresses_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 11. Table: zelle_settings
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `zelle_settings`;
CREATE TABLE `zelle_settings` (
  `id` INT NOT NULL DEFAULT 1,
  `account_holder_name` VARCHAR(150) NOT NULL DEFAULT 'Dilruba Shabnam',
  `phone` VARCHAR(50) NOT NULL DEFAULT '914-303-9181',
  `email` VARCHAR(191) DEFAULT 'clientshabnamusa@gmail.com',
  `qr_code_url` VARCHAR(500) NOT NULL DEFAULT 'https://cdn.phototourl.com/member/2026-09-29-15445970-229c-41bd-9aaf-dc85f6d6e352.jpg',
  `payment_url` VARCHAR(500) NOT NULL DEFAULT 'https://enroll.zellepay.com/qr-codes?data=eyJhY3Rpb24iOiJwYXltZW50IiwibmFtZSI6IkRpbHJ1YmEgU2hhYm5hbSIsInRva2VuIjoiOTE0MzAzOTE4MSJ9',
  `payment_instructions` TEXT DEFAULT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 12. Table: website_settings
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `website_settings`;
CREATE TABLE `website_settings` (
  `setting_key` VARCHAR(100) NOT NULL,
  `setting_value` LONGTEXT NOT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 13. Table: password_resets
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `password_resets`;
CREATE TABLE `password_resets` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `token` VARCHAR(128) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_password_resets_token` (`token`),
  KEY `idx_password_resets_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SEED INITIAL CORE DATA
-- ============================================================================

-- Seed 1: Authorized Administrator
-- Password hash for 'Admin@12345' (Secure bcrypt cost 12).
-- User can immediately log in or change password in Admin panel / forgot-password.
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `phone`, `role`, `created_at`)
VALUES
('admin-dena', 'Dena Islam (Admin)', 'denaislam09@gmail.com', '$2y$12$K8yR2u/f0k38e1hNn38V.uvd1GqYc2fGZqW7K.sYtXQjR41o5t0Wq', '914-303-9181', 'admin', NOW()),
('admin-shabnam', 'Dilruba Shabnam', 'clientshabnamusa@gmail.com', '$2y$12$K8yR2u/f0k38e1hNn38V.uvd1GqYc2fGZqW7K.sYtXQjR41o5t0Wq', '914-303-9181', 'admin', NOW())
ON DUPLICATE KEY UPDATE `role` = 'admin';

-- Seed 2: Zelle Settings
INSERT INTO `zelle_settings` (`id`, `account_holder_name`, `phone`, `email`, `qr_code_url`, `payment_url`, `payment_instructions`, `updated_at`)
VALUES (
  1,
  'Dilruba Shabnam',
  '914-303-9181',
  'clientshabnamusa@gmail.com',
  'https://cdn.phototourl.com/member/2026-09-29-15445970-229c-41bd-9aaf-dc85f6d6e352.jpg',
  'https://enroll.zellepay.com/qr-codes?data=eyJhY3Rpb24iOiJwYXltZW50IiwibmFtZSI6IkRpbHJ1YmEgU2hhYm5hbSIsInRva2VuIjoiOTE0MzAzOTE4MSJ9',
  'Please scan the Zelle QR code or send payment to 914-303-9181 (Dilruba Shabnam). Once sent, enter your Zelle confirmation/transaction number below. Our atelier will verify your payment and process your order immediately.',
  NOW()
)
ON DUPLICATE KEY UPDATE `account_holder_name` = VALUES(`account_holder_name`), `phone` = VALUES(`phone`);

-- Seed 3: Categories
INSERT INTO `categories` (`id`, `slug`, `name_en`, `name_bn`, `description`, `image`, `item_count`, `is_active`, `status`, `featured`)
VALUES
('cat-1', 'abaya', 'Abayas & Kaftans', 'আবায়া ও কাফতান', 'Handcrafted luxury modest silhouettes and ceremonial abayas.', 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=800&q=80', 8, 1, 'active', 1),
('cat-2', 'hijab-scarf', 'Hijabs & Modest Scarves', 'হিজাব ও স্কার্ফ', 'Pure modal, chiffon, and Medina silk scarves.', 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80', 12, 1, 'active', 1),
('cat-3', 'women', 'Women\'s Collection', 'মহিলাদের কালেকশন', 'Modest luxury co-ords, maxi dresses and evening capes.', 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80', 15, 1, 'active', 1),
('cat-4', 'men', 'Men\'s Kurtas & Thobes', 'পুরুষদের কুর্তা ও থোব', 'Traditional cotton kurtas and ceremonial thobes.', 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80', 6, 1, 'active', 1),
('cat-5', 'kids', 'Kids Modest Apparel', 'বাচ্চাদের পোশাক', 'Festive modest frocks, panjabis and prayer sets.', 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80', 5, 1, 'active', 1),
('cat-6', 'accessories', 'Pins, Caps & Accessories', 'এক্সেসরিজ ও পিন', 'Snag-free magnetic hijab pins and modal undercaps.', 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80', 10, 1, 'active', 1)
ON DUPLICATE KEY UPDATE `name_en` = VALUES(`name_en`);

-- Seed 4: Products
INSERT INTO `products` (`id`, `product_id`, `name`, `subtitle`, `category`, `category_label`, `price`, `original_price`, `is_new`, `is_best_seller`, `is_sale`, `rating`, `review_count`, `images`, `colors`, `color_names`, `sizes`, `description`, `features`, `fabric`, `care_instructions`, `stock`, `is_active`)
VALUES
(
  'mc-01',
  'mc-01',
  'Zahra Raw Silk Open Abaya',
  'Hand-tailored open front silhouette with subtle cuffs',
  'abaya',
  'Abaya Collection',
  135.00,
  165.00,
  1,
  1,
  1,
  4.90,
  48,
  '["https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=1000&q=85","https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=85","https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85"]',
  '[{"name":"Dusty Rose Pink","hex":"#E8B4B8"},{"name":"Sage Green","hex":"#87A987"},{"name":"Midnight Navy","hex":"#152544"},{"name":"Pristine Cream","hex":"#F7F3EE"}]',
  '["Dusty Rose Pink","Sage Green","Midnight Navy","Pristine Cream"]',
  '["52 (Petite)","54 (Regular)","56 (Medium)","58 (Tall)","60 (Extra Tall)"]',
  'Designed with effortless modern modesty in mind, the Zahra Open Abaya features premium mid-weight raw textured silk crepe that drapes fluidly without transparency. Paired with wide flared sleeves and removable waist-tie belt for versatile styling.',
  '["Premium Korean textured silk crepe fabric","Fully opaque, non-clingy flowing drape","Discreet hidden side pockets","Includes matching self-tie sash belt","Imported & hand-inspected at our USA studio"]',
  '100% Breathable Silk Crepe',
  'Dry clean recommended or gentle hand wash cold. Low steam iron.',
  9,
  1
),
(
  'mc-02',
  'mc-02',
  'Amina Pleated Modest Maxi Dress',
  'High-neck accordion pleats with elastic waist',
  'women',
  'Women',
  118.00,
  138.00,
  1,
  0,
  1,
  4.80,
  32,
  '["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85","https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=85"]',
  '[{"name":"Dusty Rose Pink","hex":"#E8B4B8"},{"name":"Olive Gold","hex":"#705E3B"},{"name":"Black Onyx","hex":"#1C1B1F"}]',
  '["Dusty Rose Pink","Olive Gold","Black Onyx"]',
  '["XS","S","M","L","XL","XXL"]',
  'An ethereal silhouette with micro-pleated tiers and a comfortable stretch smocked bodice. Fully lined with ultra-soft modal to guarantee zero transparency under direct sunlight.',
  '["Permanent accordion heat-pressed pleats","Fully lined inner skirt and bodice","Modest crew neckline with back loop closure","Elasticated balloon cuffs"]',
  'Double Chiffon Georgette (Fully Lined)',
  'Machine wash cold on delicate cycle in laundry mesh bag. Hang dry.',
  14,
  1
),
(
  'mc-03',
  'mc-03',
  'Medina Silk Luxury Hijab Scarf',
  'Crease-resistant buttery drape with subtle satin sheen',
  'hijab',
  'Hijabs & Scarves',
  24.00,
  28.00,
  0,
  1,
  1,
  5.00,
  87,
  '["https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1000&q=85","https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=1000&q=85"]',
  '[{"name":"Dusty Rose Pink","hex":"#E8B4B8"},{"name":"Taupe Nude","hex":"#C3B19E"},{"name":"Sage Green","hex":"#87A987"},{"name":"Midnight Navy","hex":"#152544"},{"name":"Warm Ivory","hex":"#FAF3E7"}]',
  '["Dusty Rose Pink","Taupe Nude","Sage Green","Midnight Navy","Warm Ivory"]',
  '["Maxi Standard (190cm x 75cm)"]',
  'Sourced from Medina textile mills, this luxurious silk-touch blend is renowned for its crease-resistant drape and non-slip texture that stays securely in place all day.',
  '["Authentic Medina crepe silk finish","Generous maxi dimension for effortless layered chest coverage","Non-slippery matte underside","Baby hemmed laser-clean edges"]',
  'Medina Silk (Poly-Silk Crepe Blend)',
  'Hand wash cold with gentle detergent. Air dry flat.',
  28,
  1
),
(
  'mc-04',
  'mc-04',
  'Embroidered Jacquard Organza Kaftan',
  'Ceremonial batwing kaftan with metallic threadwork',
  'abaya',
  'Abaya Collection',
  189.00,
  220.00,
  1,
  1,
  0,
  4.95,
  19,
  '["https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=85","https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=1000&q=85"]',
  '[{"name":"Pristine Cream","hex":"#F7F3EE"},{"name":"Emerald Forest","hex":"#1B4332"},{"name":"Blush Gold","hex":"#E6B8A2"}]',
  '["Pristine Cream","Emerald Forest","Blush Gold"]',
  '["Free Size (Fits US 4-18)"]',
  'Designed for Eid, nikah ceremonies and evening celebrations. Delicate gold metallic floral embroidery weaves throughout translucent structured organza, accompanied by a matching soft inner slip dress.',
  '["Includes matching opaque inner slip dress","Intricate zari metallic needlework","Flowing batwing cape silhouette","USA quality-controlled stitch finish"]',
  'Organza with Rayon Slip',
  'Specialist dry clean only.',
  6,
  1
)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Seed 5: Initial Customer Reviews
INSERT INTO `reviews` (`id`, `product_id`, `customer_name`, `user_name`, `rating`, `title`, `comment`, `verified`, `status`, `created_at`)
VALUES
('rev-1', 'mc-01', 'Farhana K. (Plano, TX)', 'Farhana K.', 5.0, 'Incredible fabric opacity & elegance', 'I have ordered abayas from UAE and UK, but this USA atelier quality blew me away. The drape is heavy enough to never cling, completely non-sheer, and the length 56 was true to chart.', 1, 'approved', NOW() - INTERVAL 12 DAY),
('rev-2', 'mc-03', 'Amina S. (Frisco, TX)', 'Amina S.', 5.0, 'Best Medina silk in America', 'The Medina silk does not slip even with a simple magnetic pin. Washed twice on cold delicate and not a single crease or fraying edge. Ordering 4 more shades!', 1, 'approved', NOW() - INTERVAL 8 DAY),
('rev-3', 'mc-02', 'Sumaiya N. (Houston, TX)', 'Sumaiya N.', 4.8, 'Perfect modest dress for sisters gatherings', 'The pleats stay crisp and the bodice lining makes it 100% modest without requiring an awkward additional slip underneath. Five stars!', 1, 'approved', NOW() - INTERVAL 3 DAY)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

SET FOREIGN_KEY_CHECKS = 1;
