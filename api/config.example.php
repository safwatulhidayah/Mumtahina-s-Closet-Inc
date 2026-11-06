<?php
/**
 * Mumtahina’s Closet Inc - Hostinger MySQL Central Config Template
 *
 * INSTRUCTIONS:
 * 1. Copy this file to `config.php` on your Hostinger server (inside public_html/api/).
 * 2. Enter your actual Hostinger MySQL credentials in DB_NAME, DB_USER, and DB_PASS.
 * 3. `config.php` is excluded in .gitignore and will not be overwritten by GitHub deployments.
 */

// Hostinger MySQL Database Settings
defined('DB_HOST') or define('DB_HOST', 'localhost');
defined('DB_PORT') or define('DB_PORT', '3306');
defined('DB_NAME') or define('DB_NAME', 'u926165165_dihanislam');
defined('DB_USER') or define('DB_USER', 'u926165165_mumtahina123');
defined('DB_PASS') or define('DB_PASS', 'ENTER_YOUR_HOSTINGER_DATABASE_PASSWORD_HERE');
defined('DB_CHARSET') or define('DB_CHARSET', 'utf8mb4');

// Authentication Token Signing Secret (Any 64-char random hex string)
defined('AUTH_SECRET_KEY') or define('AUTH_SECRET_KEY', 'mumtahinas_closet_secure_token_key_7f8c9b2e1a3d4f5e6a7b8c9d0e1f2a3b');
