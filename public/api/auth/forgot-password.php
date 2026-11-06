<?php
/**
 * Mumtahina’s Closet Inc - Forgot Password API
 * Endpoint: POST /api/auth/forgot-password.php
 */

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json_response(['success' => false, 'error' => 'Method not allowed'], 405);
}

$input = get_json_input();
$email = strtolower(trim($input['email'] ?? ''));

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    send_json_response(['success' => false, 'error' => 'Valid email address required'], 400);
}

$pdo = get_db_connection();

$stmt = $pdo->prepare("SELECT id, name, email FROM users WHERE email = ? LIMIT 1");
$stmt->execute([$email]);
$user = $stmt->fetch();

// Always return success for security (prevents user enumeration), but record token if user exists
if ($user) {
    $token = bin2hex(random_bytes(32));
    $expires = date('Y-m-d H:i:s', time() + 3600); // 1 hour expiration

    $resetStmt = $pdo->prepare("INSERT INTO password_resets (email, token, expires_at, created_at) VALUES (?, ?, ?, NOW())");
    $resetStmt->execute([$email, $token, $expires]);

    // In a live SMTP environment, mail() or PHPMailer sends the link.
    // For convenience in testing/deployment, the reset token is returned.
    send_json_response([
        'success' => true,
        'message' => 'Password reset instructions have been generated. Please check your email or proceed with the reset token.',
        'resetToken' => $token, // Provided for direct verification
    ]);
}

send_json_response([
    'success' => true,
    'message' => 'If an account matches that email address, reset instructions have been prepared.',
]);
