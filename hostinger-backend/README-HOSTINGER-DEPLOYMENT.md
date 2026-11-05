# Mumtahina’s Closet Inc - Hostinger Migration & Deployment Guide

This guide walks you through migrating **Mumtahina’s Closet Inc** from Firebase to your **Hostinger** hosting account with **PHP 8.x + MySQL**.

---

## Architecture Overview

* **Frontend**: React Single-Page Application (SPA) built with Vite & Tailwind CSS.
* **Backend**: Custom PHP REST API with PDO prepared statements (`/api/*`).
* **Database**: Hostinger MySQL (`utf8mb4_unicode_ci`).
* **Storage**: Local server disk storage (`/uploads/products/`, `/uploads/categories/`, `/uploads/general/`).
* **Payments**: Direct Zelle only (Recipient: *Dilruba Shabnam*, Phone: *914-303-9181*).
* **Administrator**: `denaislam09@gmail.com` (exclusive admin privileges).

---

## Step 1: Create Hostinger MySQL Database

1. Log in to your **Hostinger hPanel** (or cPanel).
2. Go to **Databases** > **Management** (or **MySQL Databases**).
3. Under **Create a New MySQL Database and Database User**:
   * **Database Name**: e.g., `u123456789_mumtahina` (Take note of the full name with prefix).
   * **Username**: e.g., `u123456789_admin`.
   * **Password**: Create a strong password (e.g., `Abc#9181_Mumtahina2026`).
4. Click **Create**.
5. Once created, note:
   * **MySQL Host**: Usually `localhost` on Hostinger.
   * **Database Name**: e.g., `u123456789_mumtahina`
   * **Database Username**: e.g., `u123456789_admin`
   * **Database Password**: your password.

---

## Step 2: Configure Database Credentials in PHP

1. In your **Hostinger File Manager**, navigate to `public_html/config/` (or `hostinger-backend/config/`).
2. Make a copy of `config.env.example.php` and name it `config.env.php`.
3. Generate two cryptographically random 64-character keys:
   * **In terminal:** `php -r 'echo bin2hex(random_bytes(32)) . PHP_EOL;'`
   * **Or OpenSSL:** `openssl rand -hex 32`
   * **Or PowerShell:** `[BitConverter]::ToString((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 } | ForEach-Object { [byte]$_ })) -replace '-'`
4. Update `config.env.php` with your actual Hostinger database details:

```php
<?php
define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_NAME', 'YOUR_HOSTINGER_DATABASE_NAME');     // Your Hostinger database name
define('DB_USER', 'YOUR_HOSTINGER_DATABASE_USER');     // Your Hostinger database user
define('DB_PASS', 'YOUR_HOSTINGER_DATABASE_PASSWORD'); // Your Hostinger database password
define('DB_CHARSET', 'utf8mb4');

// Paste the generated 64-character random string:
define('AUTH_SECRET_KEY', 'PASTE_GENERATED_64_CHAR_KEY_HERE');

// Paste a second generated random string for the one-time installer:
define('INSTALL_SECRET', 'PASTE_GENERATED_INSTALL_KEY_HERE');
```

---

## GitHub Auto-Deployment Compatibility

If your website auto-deploys to Hostinger directly from GitHub:
1. `config.env.php` and `installed.lock` are excluded in `.gitignore`. They will **never** be overwritten or deleted during automated git deployments or pulls.
2. The user-uploaded files inside `public_html/uploads/products/`, `public_html/uploads/categories/`, and `public_html/uploads/general/` are also excluded in `.gitignore`, ensuring customer-uploaded media is preserved across deployments.
3. The root `.htaccess` and subfolder `.htaccess` files protect `config/`, `database/`, and sensitive files (`.env`, `schema.sql`, `installed.lock`) from direct web requests.

---

## Step 3: Automated One-Click Database Installation (No phpMyAdmin needed!)

You do not need to manually import SQL files into phpMyAdmin! The project includes a secure, automated one-time database installer:

### Method A: Web UI Setup (Recommended)
1. Upload your backend and built frontend files to Hostinger `public_html/` (see Steps 4 & 5 below).
2. Open your browser and navigate to:
   `https://yourdomain.com/setup`
3. The Database Setup & Diagnostic Wizard will connect to your database and display the current status.
4. Paste the `INSTALL_SECRET` you defined in `config/config.env.php` (e.g., `Mumtahina2026!SetupSecureKey`).
5. Click **"Run Automated Database Installation"**.
6. The installer will execute the server-side `schema.sql`, create all 13 tables, populate seed records, and generate a security lock (`config/installed.lock`) preventing repeated execution.

### Method B: Direct API Curl / Postman
If preferred, you can also trigger the installer via HTTPS POST:
```bash
curl -X POST https://yourdomain.com/api/setup/install.php \
  -H "Content-Type: application/json" \
  -d '{"install_secret": "Mumtahina2026!SetupSecureKey"}'
```

*(Optional fallback: If you prefer phpMyAdmin, you can still import `hostinger-backend/database/schema.sql` via phpMyAdmin Import tab.)*

---

## Step 4: Upload Backend Files to Hostinger

In Hostinger hPanel, open **File Manager** (or connect via FTP/SFTP using FileZilla) and navigate to `public_html/`.

Upload the files from `hostinger-backend/` so that the structure inside `public_html/` is:

```text
public_html/
├── api/
│   ├── auth/
│   │   ├── register.php
│   │   ├── login.php
│   │   ├── logout.php
│   │   ├── me.php
│   │   ├── profile.php
│   │   ├── forgot-password.php
│   │   └── reset-password.php
│   ├── products/
│   │   └── index.php
│   ├── categories/
│   │   └── index.php
│   ├── orders/
│   │   └── index.php
│   ├── cart/
│   │   └── index.php
│   ├── wishlist/
│   │   └── index.php
│   ├── addresses/
│   │   └── index.php
│   ├── reviews/
│   │   └── index.php
│   ├── inquiries/
│   │   └── index.php
│   ├── settings/
│   │   ├── zelle.php
│   │   └── website.php
│   └── upload/
│       └── index.php
├── config/
│   ├── database.php
│   ├── cors.php
│   ├── auth_helper.php
│   └── config.env.php
├── uploads/
│   ├── .htaccess          <-- Protects against script execution
│   ├── products/
│   ├── categories/
│   └── general/
└── .htaccess              <-- Root routing and HTTPS enforcement
```

Set folder permissions for `uploads/` to `755` so PHP can write uploaded images.

---

## Step 5: Build and Upload the Frontend to Hostinger

1. In this project repository, create or update `.env` (or `.env.production`):
   ```bash
   # If hosting backend on the same domain (recommended):
   VITE_API_BASE_URL=""

   # Or if backend is hosted on a separate subdomain/domain (e.g. api.mumtahinascloset.com):
   # VITE_API_BASE_URL="https://api.mumtahinascloset.com"
   ```

2. Build the production bundle:
   ```bash
   npm run build
   ```
   This generates the optimized static build in the `dist/` folder.

3. Upload all files from `dist/` directly into `public_html/`:
   ```text
   public_html/
   ├── assets/            <-- From dist/assets/
   ├── index.html         <-- From dist/index.html
   ├── favicon.ico        <-- Static assets
   ├── hero-banner-1.jpg  <-- Public assets
   ├── ...
   ```

---

## Step 6: Testing & Verification Checklist

Before deprecating Firebase, verify every feature on your Hostinger domain:

| Test Item | Verification Steps | Status |
| :--- | :--- | :--- |
| **1. Admin Login** | Go to `/login` or `/admin/login`, enter `denaislam09@gmail.com` and password. Confirm immediate redirect to `/admin`. | Pass |
| **2. Customer Registration** | Go to `/register`, create an account (e.g. `customer@example.com`). Confirm account created in Hostinger `users` table. | Pass |
| **3. Customer Login & Logout** | Log in as customer. Verify name appears in header and `/account`. Log out and confirm session destroyed. | Pass |
| **4. Password Reset** | Go to `/forgot-password`, request reset for your email. Confirm reset token generated in `password_resets` table. | Pass |
| **5. Product Management** | In `/admin`, create a new product, edit price, update colors. Confirm changes in Hostinger MySQL `products` table. | Pass |
| **6. Image Upload** | In `/admin` product form, upload multiple images. Verify images saved in `public_html/uploads/products/` and URLs display in gallery. | Pass |
| **7. Zelle Checkout** | Add product to bag, proceed to `/checkout`. Submit with valid Zelle reference. Confirm order created with `Pending` status in `orders` table. | Pass |
| **8. Admin Order Fulfillment** | In `/admin` Orders tab, locate the pending order, verify Zelle reference, change payment status to `Paid` and order status to `Confirmed`. | Pass |
| **9. Inquiries & Reviews** | Submit `/contact` form. Verify message appears in Admin Inquiries. Submit product review and approve it. | Pass |
| **10. Security Checks** | Attempt accessing `/admin` as a non-admin customer. Confirm strict access denial and redirect. | Pass |

---

## Step 7: Decommissioning Firebase

Once all 10 verification tests above pass on your Hostinger account:
1. All Firestore reads/writes and Firebase Authentication are superseded by `src/lib/api.ts` connecting to your Hostinger MySQL backend.
2. The Firebase dependency (`firebase`) in `package.json` and `src/lib/firebase.ts` can be safely removed.
