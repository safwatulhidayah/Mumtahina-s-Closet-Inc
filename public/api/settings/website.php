<?php
/**
 * Mumtahina’s Closet Inc - Website Settings API
 * Endpoints:
 *   GET  /api/settings/website.php
 *   POST /api/settings/website.php (Admin update)
 */

require_once __DIR__ . '/../config.php';

$pdo = get_db_connection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT setting_key, setting_value FROM website_settings");
    $rows = $stmt->fetchAll();
    $settings = [];
    foreach ($rows as $r) {
        $settings[$r['setting_key']] = json_decode($r['setting_value'], true) ?: $r['setting_value'];
    }
    send_json_response(['success' => true, 'settings' => $settings]);
}

if ($method === 'POST' || $method === 'PUT') {
    require_admin_user($pdo);

    $input = get_json_input();
    $stmt = $pdo->prepare("
        INSERT INTO website_settings (setting_key, setting_value, updated_at)
        VALUES (?, ?, NOW())
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = NOW()
    ");

    foreach ($input as $key => $val) {
        $valString = is_string($val) ? $val : json_encode($val);
        $stmt->execute([$key, $valString]);
    }

    send_json_response(['success' => true, 'message' => 'Settings updated successfully']);
}

send_json_response(['success' => false, 'error' => 'Method not allowed'], 405);
