<?php
/**
 * Mumtahina’s Closet Inc - CORS & JSON Response Handler
 *
 * Enforces HTTPS API communication, CORS preflight handling, and uniform JSON formatting.
 */

// Determine origin safely
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';

// Set CORS Headers
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Session-Token");
header("Access-Control-Max-Age: 86400"); // 24 hours cache for preflight
header("Content-Type: application/json; charset=UTF-8");

// Handle HTTP OPTIONS Preflight cleanly
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

/**
 * Sends a standardized JSON response and terminates script.
 *
 * @param array|mixed $data
 * @param int $statusCode
 */
function send_json_response($data, int $statusCode = 200): void {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Reads and decodes JSON input from php://input.
 *
 * @return array
 */
function get_json_input(): array {
    $raw = file_get_contents('php://input');
    if (empty($raw)) {
        return [];
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}
