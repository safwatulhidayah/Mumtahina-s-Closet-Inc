<?php
/**
 * Mumtahina’s Closet Inc - Update User Profile API
 * Endpoint: POST or PUT /api/auth/profile.php
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth_helper.php';

$pdo = get_db_connection();
$user = require_authenticated_user($pdo);

$input = get_json_input();
$name = trim($input['name'] ?? $user['name']);
$phone = trim($input['phone'] ?? $user['phone']);
$photoUrl = trim($input['photoURL'] ?? $user['photo_url'] ?? '');
$newPassword = $input['newPassword'] ?? null;

if (empty($name)) {
    send_json_response(['success' => false, 'error' => 'Name cannot be empty'], 400);
}

if (!empty($newPassword) && strlen($newPassword) >= 6) {
    $hash = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);
    $stmt = $pdo->prepare("UPDATE users SET name = ?, phone = ?, photo_url = ?, password_hash = ? WHERE id = ?");
    $stmt->execute([$name, $phone, $photoUrl, $hash, $user['id']]);
} else {
    $stmt = $pdo->prepare("UPDATE users SET name = ?, phone = ?, photo_url = ? WHERE id = ?");
    $stmt->execute([$name, $phone, $photoUrl, $user['id']]);
}

// Fetch updated profile
$stmt = $pdo->prepare("SELECT id, name, email, phone, photo_url, role, created_at, updated_at FROM users WHERE id = ?");
$stmt->execute([$user['id']]);
$updatedUser = $stmt->fetch();
$updatedUser['isLoggedIn'] = true;

send_json_response([
    'success' => true,
    'message' => 'Profile updated successfully',
    'user'    => $updatedUser,
]);
