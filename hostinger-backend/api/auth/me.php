<?php
/**
 * Mumtahina’s Closet Inc - Get Current User Profile
 * Endpoint: GET /api/auth/me.php
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth_helper.php';

$pdo = get_db_connection();
$user = get_authenticated_user($pdo);

if (!$user) {
    send_json_response([
        'success'    => true,
        'user'       => null,
        'isLoggedIn' => false,
    ]);
}

send_json_response([
    'success'    => true,
    'user'       => $user,
    'isLoggedIn' => true,
]);
