<?php
/**
 * Mumtahina’s Closet Inc - Database Health & Setup Status API
 * Endpoint: GET /api/setup/status.php
 *
 * Verifies database connection, installed tables, and installation lock.
 * Never exposes passwords or internal credentials.
 */

require_once __DIR__ . '/../../config/cors.php';

$lockFile = __DIR__ . '/../../config/installed.lock';
$envFile  = __DIR__ . '/../../config/config.env.php';

$hasEnvFile = file_exists($envFile);
$isLocked   = file_exists($lockFile);

if ($hasEnvFile) {
    require_once $envFile;
}

// Load database credentials
defined('DB_HOST') or define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
defined('DB_PORT') or define('DB_PORT', getenv('DB_PORT') ?: '3306');
defined('DB_NAME') or define('DB_NAME', getenv('DB_NAME') ?: '');
defined('DB_USER') or define('DB_USER', getenv('DB_USER') ?: '');
defined('DB_PASS') or define('DB_PASS', getenv('DB_PASS') ?: '');
defined('DB_CHARSET') or define('DB_CHARSET', 'utf8mb4');

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

$connected = false;
$existingTables = [];
$missingTables = $requiredTables;
$error = null;
$seedSummary = [];

if (empty(DB_NAME) || empty(DB_USER)) {
    send_json_response([
        'success'        => true,
        'hasEnvConfig'   => $hasEnvFile,
        'isLocked'       => $isLocked,
        'connected'      => false,
        'installed'      => false,
        'tableCount'     => 0,
        'totalRequired'  => count($requiredTables),
        'existingTables' => [],
        'missingTables'  => $requiredTables,
        'message'        => 'Hostinger database credentials are not yet configured in config/config.env.php.',
    ]);
}

try {
    $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=%s', DB_HOST, DB_PORT, DB_NAME, DB_CHARSET);
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_TIMEOUT            => 3,
    ]);
    $connected = true;

    // Fetch existing tables
    $stmt = $pdo->query("SHOW TABLES");
    $rawTables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $rawTablesLower = array_map('strtolower', $rawTables);

    foreach ($requiredTables as $tbl) {
        if (in_array(strtolower($tbl), $rawTablesLower)) {
            $existingTables[] = $tbl;
        }
    }
    $missingTables = array_values(array_diff($requiredTables, $existingTables));

    // Inspect seeds if tables exist
    if (in_array('zelle_settings', $existingTables)) {
        $stmt = $pdo->query("SELECT account_holder_name, phone FROM zelle_settings WHERE id = 1 LIMIT 1");
        $zelle = $stmt->fetch();
        if ($zelle) {
            $seedSummary['zelle'] = [
                'recipient' => $zelle['account_holder_name'],
                'phone'     => $zelle['phone'],
            ];
        }
    }

    if (in_array('users', $existingTables)) {
        $stmt = $pdo->query("SELECT COUNT(*) AS c FROM users WHERE role = 'admin'");
        $seedSummary['adminCount'] = (int)($stmt->fetch()['c'] ?? 0);
    }

    if (in_array('products', $existingTables)) {
        $stmt = $pdo->query("SELECT COUNT(*) AS c FROM products");
        $seedSummary['productCount'] = (int)($stmt->fetch()['c'] ?? 0);
    }

    if (in_array('categories', $existingTables)) {
        $stmt = $pdo->query("SELECT COUNT(*) AS c FROM categories");
        $seedSummary['categoryCount'] = (int)($stmt->fetch()['c'] ?? 0);
    }

} catch (PDOException $e) {
    $connected = false;
    $msg = $e->getMessage();
    if (stripos($msg, 'Access denied') !== false) {
        $error = 'Access denied: Please check that DB_USER and DB_PASS in config/config.env.php match your Hostinger database user credentials.';
    } elseif (stripos($msg, 'Unknown database') !== false) {
        $error = 'Unknown database: Please verify that DB_NAME in config/config.env.php matches your Hostinger database name exactly.';
    } elseif (stripos($msg, 'Connection refused') !== false || stripos($msg, 'Can\'t connect') !== false) {
        $error = 'Cannot reach MySQL server. On Hostinger, DB_HOST should usually be "localhost".';
    } else {
        $error = 'Unable to connect to MySQL database. Please verify Hostinger DB name, user, and password in config/config.env.php.';
    }
}

$isInstalled = $connected && (count($missingTables) === 0);

send_json_response([
    'success'        => true,
    'hasEnvConfig'   => $hasEnvFile,
    'isLocked'       => $isLocked,
    'connected'      => $connected,
    'installed'      => $isInstalled,
    'canInstall'     => $connected && !$isLocked && (!$isInstalled || count($missingTables) > 0),
    'tableCount'     => count($existingTables),
    'totalRequired'  => count($requiredTables),
    'existingTables' => $existingTables,
    'missingTables'  => $missingTables,
    'seeds'          => $seedSummary,
    'error'          => $error,
]);
