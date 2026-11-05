<?php
/**
 * Mumtahina’s Closet Inc - Logout API
 * Endpoint: POST /api/auth/logout.php
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/auth_helper.php';

start_secure_session();

$_SESSION = [];
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params["path"],
        $params["domain"],
        $params["secure"],
        $params["httponly"]
    );
}
session_destroy();

send_json_response([
    'success' => true,
    'message' => 'Signed out successfully'
]);
