<?php
/**
 * Mumtahina’s Closet Inc - Customer Registration API
 * Endpoint: POST /api/auth/register.php
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth_helper.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json_response(['success' => false, 'error' => 'Method not allowed'], 405);
}

$input = get_json_input();
$name = trim($input['name'] ?? '');
$email = strtolower(trim($input['email'] ?? ''));
$password = $input['password'] ?? '';
$phone = trim($input['phone'] ?? '');

// Validation
if (empty($name)) {
    send_json_response(['success' => false, 'error' => 'Full name is required'], 400);
}
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    send_json_response(['success' => false, 'error' => 'A valid email address is required'], 400);
}
if (strlen($password) < 6) {
    send_json_response(['success' => false, 'error' => 'Password must be at least 6 characters'], 400);
}

$pdo = get_db_connection();

// Check if user with this email already exists
$checkStmt = $pdo->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
$checkStmt->execute([$email]);
if ($checkStmt->fetch()) {
    send_json_response(['success' => false, 'error' => 'An account with this email address already exists. Please log in.'], 409);
}

// Generate secure ID and hash password
$userId = 'usr_' . bin2hex(random_bytes(10));
$passwordHash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
$role = is_admin_email($email) ? 'admin' : 'customer';

$insertStmt = $pdo->prepare("
    INSERT INTO users (id, name, email, password_hash, phone, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?, NOW())
");
$insertStmt->execute([$userId, $name, $email, $passwordHash, $phone, $role]);

// Fetch newly created user profile
$userStmt = $pdo->prepare("SELECT id, name, email, phone, photo_url, role, created_at FROM users WHERE id = ?");
$userStmt->execute([$userId]);
$user = $userStmt->fetch();
$user['isLoggedIn'] = true;

// Establish secure session
start_secure_session();
$_SESSION['user_id'] = $userId;
$_SESSION['user_email'] = $email;
$_SESSION['user_role'] = $role;

$token = generate_auth_token($user);

send_json_response([
    'success' => true,
    'message' => 'Registration successful! Welcome to Mumtahina’s Closet Inc.',
    'user'    => $user,
    'token'   => $token,
], 201);
