<?php
/**
 * Mumtahina’s Closet Inc - Hostinger MySQL Environment Configuration Template
 *
 * INSTRUCTIONS FOR HOSTINGER DEPLOYMENT:
 * 1. Log in to your Hostinger File Manager (or connect via SSH/SFTP).
 * 2. In `public_html/config/` (or `hostinger-backend/config/`), copy this file to:
 *    `config.env.php`
 * 3. Replace the placeholder values below with your ACTUAL Hostinger MySQL details from:
 *    Hostinger hPanel -> Databases -> Management
 * 4. Keep this file strictly on your Hostinger server. It is ignored in .gitignore
 *    so git pulls and automatic GitHub deployments will NEVER overwrite it.
 */

// ==========================================
// 1. Hostinger MySQL Database Configuration
// ==========================================
// On Hostinger, MySQL host is almost always 'localhost' or '127.0.0.1'
define('DB_HOST', 'localhost');

// Default MySQL port is 3306
define('DB_PORT', '3306');

// Enter your exact Hostinger database name (e.g. u123456789_mumtahina)
define('DB_NAME', 'YOUR_HOSTINGER_DATABASE_NAME');

// Enter your exact Hostinger database user (e.g. u123456789_admin)
define('DB_USER', 'YOUR_HOSTINGER_DATABASE_USER');

// Enter your exact Hostinger database password
define('DB_PASS', 'YOUR_HOSTINGER_DATABASE_PASSWORD');

// Standard utf8mb4 encoding for full emoji and international character support
define('DB_CHARSET', 'utf8mb4');

// ==========================================
// 2. Security Keys (Server-Side Only)
// ==========================================
// Cryptographically strong random key for HMAC session token signing.
// Replace with a 64-character random string.
define('AUTH_SECRET_KEY', 'GENERATE_A_64_CHAR_RANDOM_HEX_STRING_FOR_AUTH');

// One-Time Automated Database Installer Secret Key.
// Use this secret when visiting /setup to authorize the one-time database creation.
define('INSTALL_SECRET', 'GENERATE_A_64_CHAR_RANDOM_HEX_STRING_FOR_INSTALLER');


