<?php
/**
 * Mumtahina’s Closet Inc - Central PHP Backend Configuration & Database Connection
 * Architecture: React/Vite Frontend -> PHP REST API -> Hostinger MySQL Database
 *
 * File Path: public_html/api/config.php (or api/config.php)
 *
 * INSTRUCTIONS FOR HOSTINGER:
 * 1. Enter your actual Hostinger MySQL database credentials below in DB_NAME, DB_USER, and DB_PASS.
 * 2. Never commit your live database password to GitHub (api/config.php is in .gitignore).
 */

// -----------------------------------------------------------------------------
// 1. HTTP Headers & CORS Configuration
// -----------------------------------------------------------------------------
$allowedOrigins = [
    'https://mumtahinasclosetinc.com',
    'https://www.mumtahinasclosetinc.com',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
];

$httpOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($httpOrigin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$httpOrigin}");
} else {
    // Fallback for API clients and same-origin requests
    header("Access-Control-Allow-Origin: " . (!empty($httpOrigin) ? $httpOrigin : '*'));
}

header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Session-Token');
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight OPTIONS requests immediately
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// -----------------------------------------------------------------------------
// 2. Hostinger MySQL Database Credentials (Update with your Hostinger hPanel values)
// -----------------------------------------------------------------------------
// Optional local configuration override if config.local.php exists
if (file_exists(__DIR__ . '/config.local.php')) {
    require_once __DIR__ . '/config.local.php';
}

defined('DB_HOST') or define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
defined('DB_PORT') or define('DB_PORT', getenv('DB_PORT') ?: '3306');
defined('DB_NAME') or define('DB_NAME', getenv('DB_NAME') ?: 'u926165165_dihanislam');
defined('DB_USER') or define('DB_USER', getenv('DB_USER') ?: 'u926165165_mumtahina123');
defined('DB_PASS') or define('DB_PASS', getenv('DB_PASS') ?: 'ENTER_YOUR_HOSTINGER_DATABASE_PASSWORD_HERE');
defined('DB_CHARSET') or define('DB_CHARSET', 'utf8mb4');

// Secret key for HMAC token signing (keep server-side only)
defined('AUTH_SECRET_KEY') or define('AUTH_SECRET_KEY', 'mumtahinas_closet_secure_token_key_7f8c9b2e1a3d4f5e6a7b8c9d0e1f2a3b');

// Authorized Admin Identifiers
const AUTHORIZED_ADMIN_EMAILS = [
    'admin',
    'admin@mumtahinascloset.com',
    'denaislam09@gmail.com',
    'clientshabnamusa@gmail.com',
];

// -----------------------------------------------------------------------------
// 3. Central Database Connection (PDO)
// -----------------------------------------------------------------------------
/**
 * Returns a shared PDO instance with prepared statements and utf8mb4 encoding.
 * Returns clear, sanitized error messages without exposing passwords.
 *
 * @return PDO
 */
function get_db(): PDO {
    static $pdo = null;

    if ($pdo !== null) {
        return $pdo;
    }

    if (empty(DB_NAME) || empty(DB_USER)) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error'   => 'Hostinger MySQL database credentials incomplete in api/config.php.',
            'code'    => 'DB_CONFIG_MISSING'
        ]);
        exit;
    }

    if (empty(DB_PASS) || DB_PASS === 'ENTER_YOUR_HOSTINGER_DATABASE_PASSWORD_HERE') {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error'   => 'Database password is not yet configured. Please enter your Hostinger database user password in public_html/api/config.php.',
            'code'    => 'DB_PASSWORD_REQUIRED'
        ]);
        exit;
    }

    $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=%s', DB_HOST, DB_PORT, DB_NAME, DB_CHARSET);

    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
        PDO::ATTR_TIMEOUT            => 5,
    ];

    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        $msg = $e->getMessage();
        $errorMsg = 'Database connection failed. Please verify Hostinger MySQL credentials in api/config.php.';

        if (stripos($msg, 'Access denied') !== false) {
            $errorMsg = 'Database access denied: Please verify DB_USER and DB_PASS in api/config.php.';
        } elseif (stripos($msg, 'Unknown database') !== false) {
            $errorMsg = 'Unknown database: Please verify that DB_NAME in api/config.php matches your Hostinger database name.';
        } elseif (stripos($msg, 'Connection refused') !== false || stripos($msg, 'Can\'t connect') !== false) {
            $errorMsg = 'Cannot reach MySQL server. On Hostinger, DB_HOST should usually be "localhost".';
        }

        echo json_encode([
            'success' => false,
            'error'   => $errorMsg,
            'code'    => 'DB_CONNECTION_ERROR'
        ]);
        exit;
    }
}

/**
 * Backward compatibility alias for get_db()
 */
function get_db_connection(): PDO {
    return get_db();
}

// -----------------------------------------------------------------------------
// 4. Session & Request Helpers
// -----------------------------------------------------------------------------
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
 * Reads JSON payload from php://input.
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

/**
 * Sends a structured JSON response and terminates script.
 *
 * @param array $data
 * @param int $statusCode
 */
function send_json_response(array $data, int $statusCode = 200): void {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// -----------------------------------------------------------------------------
// 5. Authentication & Authorization Helpers
// -----------------------------------------------------------------------------
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
 * Generates an HMAC-signed session token.
 *
 * @param array|string $userOrId
 * @param string|null $email
 * @return string
 */
function generate_auth_token($userOrId, ?string $email = null): string {
    if (is_array($userOrId)) {
        $userId = $userOrId['id'] ?? '';
        $email = $userOrId['email'] ?? '';
        $role = $userOrId['role'] ?? 'customer';
    } else {
        $userId = (string)$userOrId;
        $email = $email ?: '';
        $role = 'customer';
    }
    $payload = [
        'uid'   => $userId,
        'email' => $email,
        'role'  => $role,
        'iat'   => time(),
        'exp'   => time() + (86400 * 30), // 30 days
    ];
    $base64 = base64_encode(json_encode($payload));
    $signature = hash_hmac('sha256', $base64, AUTH_SECRET_KEY);
    return $base64 . '.' . $signature;
}

/**
 * Verifies an HMAC session token and returns the payload if valid.
 *
 * @param string $token
 * @return array|null
 */
function verify_auth_token(string $token): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 2) {
        return null;
    }
    [$base64, $signature] = $parts;
    $expected = hash_hmac('sha256', $base64, AUTH_SECRET_KEY);
    if (!hash_equals($expected, $signature)) {
        return null;
    }
    $data = json_decode(base64_decode($base64), true);
    if (!is_array($data) || empty($data['uid']) || empty($data['exp'])) {
        return null;
    }
    if ($data['exp'] < time()) {
        return null;
    }
    return $data;
}

/**
 * Retrieves the current authenticated user's profile from session or Bearer token.
 *
 * @return array|null
 */
function get_current_user_profile(): ?array {
    start_secure_session();

    $userId = $_SESSION['user_id'] ?? null;

    // Check Bearer token if session not found
    if (!$userId) {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            $tokenData = verify_auth_token(trim($matches[1]));
            if ($tokenData) {
                $userId = $tokenData['uid'];
            }
        }
    }

    // Check custom X-Session-Token header
    if (!$userId) {
        $headers = getallheaders();
        $customToken = $headers['X-Session-Token'] ?? $headers['x-session-token'] ?? $_SERVER['HTTP_X_SESSION_TOKEN'] ?? '';
        if (!empty($customToken)) {
            $tokenData = verify_auth_token(trim($customToken));
            if ($tokenData) {
                $userId = $tokenData['uid'];
            }
        }
    }

    if (!$userId) {
        return null;
    }

    try {
        $pdo = get_db();
        $stmt = $pdo->prepare("SELECT id, name, email, phone, photo_url, role, created_at FROM users WHERE id = ? LIMIT 1");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        return $user ?: null;
    } catch (PDOException $e) {
        return null;
    }
}

/**
 * Returns current user or null (alias).
 *
 * @param PDO|null $pdo
 * @return array|null
 */
function get_authenticated_user(?PDO $pdo = null): ?array {
    return get_current_user_profile();
}

/**
 * Enforces authenticated user access.
 *
 * @param PDO|null $pdo
 * @return array
 */
function require_authenticated_user(?PDO $pdo = null): array {
    $user = get_current_user_profile();
    if (!$user) {
        send_json_response([
            'success' => false,
            'error'   => 'Authentication required. Please sign in to your account.',
            'code'    => 'AUTH_REQUIRED'
        ], 401);
    }
    return $user;
}

/**
 * Enforces admin authorization.
 *
 * @param PDO|null $pdo
 * @return array
 */
function require_admin_user(?PDO $pdo = null): array {
    $user = require_authenticated_user($pdo);
    if ($user['role'] !== 'admin' && !is_admin_email($user['email'])) {
        send_json_response([
            'success' => false,
            'error'   => 'Access denied. Administrator privileges required.',
            'code'    => 'ADMIN_REQUIRED'
        ], 403);
    }
    return $user;
}
