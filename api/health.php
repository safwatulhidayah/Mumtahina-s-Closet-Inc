<?php
/**
 * Mumtahina’s Closet Inc - Deployment & System Health Check API
 * Endpoint: GET /api/health.php
 *
 * Verifies that the PHP API is active, the database connection is functional,
 * and the 13 required relational tables exist.
 * Never exposes passwords, secrets, or internal server details.
 */

require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=UTF-8');

$response = [
    'status'            => 'healthy',
    'timestamp'         => gmdate('c'),
    'api_service'       => 'Mumtahina’s Closet Inc REST API',
    'version'           => '1.0.0',
    'api_base_url'      => 'https://mumtahinasclosetinc.com/api',
    'config_loaded'     => true,
    'database'          => [
        'connected'     => false,
        'database_name' => defined('DB_NAME') ? DB_NAME : null,
        'table_count'   => 0,
        'total_required'=> 13,
        'is_ready'      => false,
    ],
];

// Check uploads folder writable
$uploadsDir = realpath(__DIR__ . '/../uploads') ?: (dirname(__DIR__) . '/uploads');
$response['uploads'] = [
    'directory_exists' => is_dir($uploadsDir),
    'is_writable'      => is_writable($uploadsDir),
];

if (!is_db_configured()) {
    $response['status'] = 'configuration_needed';
    $response['database']['connected'] = false;
    $response['message'] = 'Database password is not yet configured. Please set the DB_PASS environment secret in Hostinger or create public_html/api/config.local.php.';
    send_json_response($response, 200);
}

try {
    $pdo = get_db();
    $response['database']['connected'] = true;

    // Check 13 required tables
    $stmt = $pdo->query("SHOW TABLES");
    $existing = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $existingLower = array_map('strtolower', $existing);

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

    $found = [];
    $missing = [];

    foreach ($requiredTables as $tbl) {
        if (in_array(strtolower($tbl), $existingLower, true)) {
            $found[] = $tbl;
        } else {
            $missing[] = $tbl;
        }
    }

    $response['database']['table_count']   = count($found);
    $response['database']['tables_found']  = $found;
    $response['database']['tables_missing']= $missing;
    $response['database']['is_ready']      = (count($missing) === 0);

    if (count($missing) > 0) {
        $response['status'] = 'degraded';
        $response['message'] = 'Database connected, but some required tables are missing.';
    } else {
        $response['message'] = 'PHP API and Hostinger MySQL database are fully connected and operational.';
    }

    send_json_response($response, 200);

} catch (Throwable $e) {
    $response['status'] = 'error';
    $response['database']['connected'] = false;
    $response['message'] = 'Database connection failed. Please ensure DB_PASS is configured in public_html/api/config.php.';
    send_json_response($response, 500);
}
