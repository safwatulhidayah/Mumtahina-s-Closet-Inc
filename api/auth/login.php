<?php
/**
 * Mumtahina’s Closet Inc - Customer & Admin Login API
 * Endpoint: POST /api/auth/login.php
 */

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json_response(['success' => false, 'error' => 'Method not allowed'], 405);
}

$input = get_json_input();
$email = strtolower(trim($input['email'] ?? ''));
$password = $input['password'] ?? '';

if (empty($email) || empty($password)) {
    send_json_response(['success' => false, 'error' => 'Email and password are required'], 400);
}

$pdo = get_db_connection();

// Lookup user by email
$stmt = $pdo->prepare("SELECT id, name, email, password_hash, phone, photo_url, role, created_at FROM users WHERE email = ? LIMIT 1");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    send_json_response([
        'success' => false,
        'error'   => 'Invalid email or password. Please check your credentials and try again.',
        'code'    => 'INVALID_CREDENTIALS'
    ], 401);
}

// Strip password hash from returned data
unset($user['password_hash']);

// Enforce admin privileges if user email is in authorized admin list
if (is_admin_email($user['email'])) {
    $user['role'] = 'admin';
    // Update role in DB if not already admin
    $updateRole = $pdo->prepare("UPDATE users SET role = 'admin' WHERE id = ?");
    $updateRole->execute([$user['id']]);
}

$user['isLoggedIn'] = true;

// Establish session
start_secure_session();
$_SESSION['user_id'] = $user['id'];
$_SESSION['user_email'] = $user['email'];
$_SESSION['user_role'] = $user['role'];

$token = generate_auth_token($user);

send_json_response([
    'success' => true,
    'message' => 'Signed in successfully',
    'user'    => $user,
    'token'   => $token,
]);
