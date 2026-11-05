<?php
/**
 * Mumtahina’s Closet Inc - Secure Automated Database Installer API
 * Endpoint: POST /api/setup/install.php
 *
 * Reads and executes database/schema.sql on the Hostinger MySQL server.
 * Never executes user-supplied SQL.
 * Requires the server-side INSTALL_SECRET defined in config/config.env.php.
 * Locks itself permanently upon completion.
 */

require_once __DIR__ . '/../../config/cors.php';

// 1. Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json_response([
        'success' => false,
        'error'   => 'Method not allowed. Installation requires an authorized POST request.',
    ], 405);
}

// 2. Check installation lock file
$lockFile = __DIR__ . '/../../config/installed.lock';
if (file_exists($lockFile)) {
    send_json_response([
        'success'   => false,
        'installed' => true,
        'locked'    => true,
        'error'     => 'The database has already been installed and is permanently locked for security. To re-install, delete config/installed.lock from Hostinger File Manager.',
    ], 403);
}

// 3. Load server configuration
$envFile = __DIR__ . '/../../config/config.env.php';
if (!file_exists($envFile)) {
    send_json_response([
        'success' => false,
        'error'   => 'Configuration file config/config.env.php not found. Please create it from config.env.example.php and configure your Hostinger MySQL credentials.',
    ], 500);
}

require_once $envFile;

// 4. Verify INSTALL_SECRET authorization
if (!defined('INSTALL_SECRET') || empty(INSTALL_SECRET)) {
    send_json_response([
        'success' => false,
        'error'   => 'INSTALL_SECRET is not configured in config/config.env.php. Please define a secure INSTALL_SECRET before running the installer.',
    ], 500);
}

$input = get_json_input();
$submittedSecret = trim(
    $input['secret']
    ?? $_POST['secret']
    ?? $_SERVER['HTTP_X_INSTALL_SECRET']
    ?? ''
);

if (empty($submittedSecret) || !hash_equals(INSTALL_SECRET, $submittedSecret)) {
    // Add brief delay to mitigate brute force
    usleep(500000); // 0.5s
    send_json_response([
        'success' => false,
        'error'   => 'Invalid installation secret. Please provide the INSTALL_SECRET configured in config/config.env.php.',
    ], 401);
}

// 5. Connect to Hostinger MySQL
defined('DB_HOST') or define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
defined('DB_PORT') or define('DB_PORT', getenv('DB_PORT') ?: '3306');
defined('DB_NAME') or define('DB_NAME', getenv('DB_NAME') ?: '');
defined('DB_USER') or define('DB_USER', getenv('DB_USER') ?: '');
defined('DB_PASS') or define('DB_PASS', getenv('DB_PASS') ?: '');
defined('DB_CHARSET') or define('DB_CHARSET', 'utf8mb4');

if (empty(DB_NAME) || empty(DB_USER)) {
    send_json_response([
        'success' => false,
        'error'   => 'Database credentials incomplete in config/config.env.php. DB_NAME and DB_USER must be provided.',
    ], 500);
}

try {
    $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=%s', DB_HOST, DB_PORT, DB_NAME, DB_CHARSET);
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
        PDO::ATTR_TIMEOUT            => 10,
    ]);
} catch (PDOException $e) {
    $msg = $e->getMessage();
    $safeError = 'Could not connect to Hostinger MySQL database. Please verify host, database name, user, and password in config/config.env.php.';
    if (stripos($msg, 'Access denied') !== false) {
        $safeError = 'Access denied: Please verify that DB_USER and DB_PASS in config/config.env.php match your Hostinger database user.';
    } elseif (stripos($msg, 'Unknown database') !== false) {
        $safeError = 'Unknown database: Please verify that DB_NAME matches your Hostinger database name exactly.';
    }
    send_json_response([
        'success' => false,
        'error'   => $safeError,
    ], 500);
}

// 6. Locate and read server-side schema.sql
$schemaPath = realpath(__DIR__ . '/../../database/schema.sql');
if (!$schemaPath || !file_exists($schemaPath)) {
    send_json_response([
        'success' => false,
        'error'   => 'Server-side schema file database/schema.sql was not found.',
    ], 500);
}

$sqlContent = file_get_contents($schemaPath);
if (empty($sqlContent)) {
    send_json_response([
        'success' => false,
        'error'   => 'The database/schema.sql file is empty.',
    ], 500);
}

// 7. Parse and execute SQL queries safely
// Split SQL by semicolon followed by newline, ignoring comment blocks
$statements = [];
$lines = explode("\n", $sqlContent);
$current = '';

foreach ($lines as $line) {
    $trimmed = trim($line);
    // Skip empty lines or pure single-line comment lines
    if ($trimmed === '' || str_starts_with($trimmed, '--') || str_starts_with($trimmed, '/*')) {
        continue;
    }

    $current .= $line . "\n";

    if (str_ends_with($trimmed, ';')) {
        $statements[] = trim($current);
        $current = '';
    }
}

if (!empty(trim($current))) {
    $statements[] = trim($current);
}

$executedCount = 0;
$errors = [];

try {
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");

    foreach ($statements as $stmtSql) {
        $clean = trim($stmtSql);
        if (empty($clean)) continue;
        $pdo->exec($clean);
        $executedCount++;
    }

    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");
} catch (PDOException $e) {
    send_json_response([
        'success' => false,
        'error'   => 'Database execution error: ' . $e->getMessage(),
        'step'    => 'Executing SQL schema statements',
    ], 500);
}

// 8. Verify that all 13 required tables now exist
$requiredTables = [
    'users',
    'categories',
    'products',
    'orders',
    'order_items',
    'cart_items',
    'wishlists',
    'reviews',
    'inquiries',
    'shipping_addresses',
    'zelle_settings',
    'website_settings',
    'password_resets',
];

$stmt = $pdo->query("SHOW TABLES");
$createdTables = $stmt->fetchAll(PDO::FETCH_COLUMN);
$createdTablesLower = array_map('strtolower', $createdTables);

$verifiedTables = [];
foreach ($requiredTables as $tbl) {
    if (in_array(strtolower($tbl), $createdTablesLower)) {
        $verifiedTables[] = $tbl;
    }
}

$missing = array_diff($requiredTables, $verifiedTables);
if (count($missing) > 0) {
    send_json_response([
        'success' => false,
        'error'   => 'Verification failed. The following required tables are missing: ' . implode(', ', $missing),
    ], 500);
}

// 9. Inspect seeded data counts
$counts = [];
try {
    $cStmt = $pdo->query("SELECT COUNT(*) FROM products");
    $counts['products'] = (int)$cStmt->fetchColumn();

    $cStmt = $pdo->query("SELECT COUNT(*) FROM categories");
    $counts['categories'] = (int)$cStmt->fetchColumn();

    $cStmt = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'admin'");
    $counts['admins'] = (int)$cStmt->fetchColumn();

    $cStmt = $pdo->query("SELECT COUNT(*) FROM zelle_settings");
    $counts['zelleSettings'] = (int)$cStmt->fetchColumn();
} catch (Exception $e) {
    // Non-fatal
}

// 10. Write permanent installation lock file
$lockData = json_encode([
    'installed_at' => date('c'),
    'ip'           => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
    'table_count'  => count($verifiedTables),
    'tables'       => $verifiedTables,
    'counts'       => $counts,
], JSON_PRETTY_PRINT);

file_put_contents($lockFile, $lockData);

send_json_response([
    'success'       => true,
    'message'       => 'Mumtahina’s Closet Inc database installed and verified successfully!',
    'installedAt'   => date('Y-m-d H:i:s'),
    'tableCount'    => count($verifiedTables),
    'tables'        => $verifiedTables,
    'counts'        => $counts,
    'locked'        => true,
    'nextSteps'     => [
        'The database installation has been permanently locked.',
        'You can now log in at /admin/login with your admin credentials (denaislam09@gmail.com).',
        'Optional: For additional security, you may delete the hostinger-backend/api/setup/ directory from your server.',
    ],
]);
