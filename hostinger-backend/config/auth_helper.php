<?php
/**
 * Mumtahina’s Closet Inc - Authentication & Authorization Helper
 *
 * Implements secure session & token-based authentication using PHP password_hash(),
 * password_verify(), and role-based access control.
 */

require_once __DIR__ . '/database.php';

// List of authorized administrators
const AUTHORIZED_ADMIN_EMAILS = [
    'denaislam09@gmail.com',
    'clientshabnamusa@gmail.com',
];

// Secret key for HMAC token signing (Update with a random string on Hostinger)
defined('AUTH_SECRET_KEY') or define('AUTH_SECRET_KEY', getenv('AUTH_SECRET_KEY') ?: 'mumtahinas_closet_super_secure_hmac_secret_2026');

/**
 * Starts a secure PHP session.
 */
function start_secure_session(): void {
    if (session_status() === PHP_SESSION_NONE) {
        $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
            || ($_SERVER['SERVER_PORT'] ?? 0) == 443
            || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');

        session_set_cookie_params([
            'lifetime' => 86400 * 30, // 30 days
            'path'     => '/',
            'domain'   => '',
            'secure'   => $isHttps,
            'httponly' => true,
            'samesite' => $isHttps ? 'None' : 'Lax',
        ]);
        session_start();
    }
}

/**
 * Checks if an email is an authorized administrator.
 *
 * @param string|null $email
 * @return bool
 */
function is_admin_email(?string $email): bool {
    if (empty($email)) {
        return false;
    }
    $normalized = strtolower(trim($email));
    foreach (AUTHORIZED_ADMIN_EMAILS as $adminEmail) {
        if (strtolower($adminEmail) === $normalized) {
            return true;
        }
    }
    return false;
}

/**
 * Generates an encrypted/signed bearer token for seamless client-side authorization.
 *
 * @param array $user
 * @return string
 */
function generate_auth_token(array $user): string {
    $payload = [
        'uid'   => $user['id'],
        'email' => $user['email'],
        'role'  => $user['role'] ?? 'customer',
        'iat'   => time(),
        'exp'   => time() + (86400 * 30), // 30 days
    ];
    $json = json_encode($payload);
    $base64 = base64_encode($json);
    $signature = hash_hmac('sha256', $base64, AUTH_SECRET_KEY);
    return $base64 . '.' . $signature;
}

/**
 * Verifies a bearer token and returns decoded payload if valid.
 *
 * @param string $token
 * @return array|null
 */
function verify_auth_token(string $token): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 2) {
        return null;
    }
    list($base64, $signature) = $parts;
    $expected = hash_hmac('sha256', $base64, AUTH_SECRET_KEY);
    if (!hash_equals($expected, $signature)) {
        return null;
    }
    $payload = json_decode(base64_decode($base64), true);
    if (!is_array($payload) || !isset($payload['exp']) || $payload['exp'] < time()) {
        return null;
    }
    return $payload;
}

/**
 * Retrieves the currently authenticated user from Session or Authorization header.
 *
 * @param PDO $pdo
 * @return array|null
 */
function get_authenticated_user(PDO $pdo): ?array {
    start_secure_session();

    $userId = $_SESSION['user_id'] ?? null;

    // Check Authorization: Bearer <token> or X-Session-Token
    if (!$userId) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
        if (empty($authHeader) && isset($_SERVER['HTTP_X_SESSION_TOKEN'])) {
            $authHeader = 'Bearer ' . $_SERVER['HTTP_X_SESSION_TOKEN'];
        }

        if (preg_match('/Bearer\s+(\S+)/i', $authHeader, $matches)) {
            $tokenPayload = verify_auth_token($matches[1]);
            if ($tokenPayload && !empty($tokenPayload['uid'])) {
                $userId = $tokenPayload['uid'];
            }
        }
    }

    if (!$userId) {
        return null;
    }

    $stmt = $pdo->prepare("SELECT id, name, email, phone, photo_url, role, created_at, updated_at FROM users WHERE id = ? LIMIT 1");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if ($user) {
        // Enforce admin privileges if user email matches authorized admin emails
        if (is_admin_email($user['email'])) {
            $user['role'] = 'admin';
        }
        $user['isLoggedIn'] = true;
    }

    return $user ?: null;
}

/**
 * Requires an authenticated user, or halts with 401 Unauthorized.
 *
 * @param PDO $pdo
 * @return array
 */
function require_authenticated_user(PDO $pdo): array {
    $user = get_authenticated_user($pdo);
    if (!$user) {
        send_json_response([
            'success' => false,
            'error'   => 'Authentication required. Please log in to proceed.',
            'code'    => 'UNAUTHORIZED'
        ], 401);
    }
    return $user;
}

/**
 * Requires an authorized administrator, or halts with 403 Forbidden.
 *
 * @param PDO $pdo
 * @return array
 */
function require_admin_user(PDO $pdo): array {
    $user = require_authenticated_user($pdo);
    $isAdmin = ($user['role'] === 'admin') || is_admin_email($user['email']);

    if (!$isAdmin) {
        send_json_response([
            'success' => false,
            'error'   => 'Access denied. Administrator credentials required.',
            'code'    => 'FORBIDDEN'
        ], 403);
    }

    return $user;
}
