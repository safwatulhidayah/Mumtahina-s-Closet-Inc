<?php
/**
 * Mumtahina’s Closet Inc - Password Reset Confirmation API
 * Endpoint: POST /api/auth/reset-password.php
 */

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json_response(['success' => false, 'error' => 'Method not allowed'], 405);
}

$input = get_json_input();
$token = trim($input['token'] ?? '');
$newPassword = $input['password'] ?? '';

if (empty($token) || strlen($newPassword) < 6) {
    send_json_response(['success' => false, 'error' => 'Valid reset token and minimum 6 character password required'], 400);
}

$pdo = get_db_connection();

$stmt = $pdo->prepare("SELECT email FROM password_resets WHERE token = ? AND expires_at > NOW() ORDER BY id DESC LIMIT 1");
$stmt->execute([$token]);
$reset = $stmt->fetch();

if (!$reset) {
    send_json_response(['success' => false, 'error' => 'Reset token is invalid or has expired. Please request a new one.'], 400);
}

$email = $reset['email'];
$newHash = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);

// Update user password
$updateUser = $pdo->prepare("UPDATE users SET password_hash = ? WHERE email = ?");
$updateUser->execute([$newHash, $email]);

// Delete used tokens
$cleanup = $pdo->prepare("DELETE FROM password_resets WHERE email = ?");
$cleanup->execute([$email]);

send_json_response([
    'success' => true,
    'message' => 'Your password has been successfully reset. You may now log in.'
]);
