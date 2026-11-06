<?php
/**
 * Mumtahina’s Closet Inc - Database Connection Test API
 * Endpoint: GET /api/test.php
 *
 * Verifies PDO connectivity to Hostinger MySQL and checks table status.
 * Never exposes passwords or internal credentials.
 */

require_once __DIR__ . '/config.php';

try {
    $pdo = get_db();

    // Query tables in current database
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

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

    $tablesLower = array_map('strtolower', $tables);
    $found = [];
    $missing = [];

    foreach ($requiredTables as $tbl) {
        if (in_array(strtolower($tbl), $tablesLower, true)) {
            $found[] = $tbl;
        } else {
            $missing[] = $tbl;
        }
    }

    send_json_response([
        'success'       => true,
        'connected'     => true,
        'message'       => 'Hostinger MySQL database connection successful.',
        'database'      => DB_NAME,
        'tableCount'    => count($found),
        'totalRequired' => count($requiredTables),
        'tablesFound'   => $found,
        'tablesMissing' => $missing,
        'isReady'       => count($missing) === 0,
    ]);

} catch (Throwable $e) {
    send_json_response([
        'success'   => false,
        'connected' => false,
        'error'     => 'Unable to connect to MySQL database. Please verify Hostinger credentials in api/config.php.',
        'code'      => 'TEST_CONNECTION_FAILED'
    ], 500);
}
