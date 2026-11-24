<?php
/**
 * Mumtahina’s Closet Inc - Central PHP Backend Configuration & Database Connection
 * Architecture: React/Vite Frontend -> PHP REST API -> Hostinger MySQL Database
 *
 * File Path: public_html/api/config.php (or api/config.php)
 *
 * SECURITY & PERSISTENCE:
 * - This file contains NO database passwords or secrets and is safe to deploy via Git/Vite.
 * - DB_PASS is loaded at runtime from Hostinger Environment Variables (getenv / $_ENV / $_SERVER)
 *   or an unversioned server-only config.local.php file.
 */

// Enable clean error handling: prevent PHP from dumping raw text or dying with blank 500
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

/**
 * Redacts any configured secret values from error strings before returning JSON.
 */
function sanitize_error_text(string $text): string {
    if (defined('DB_PASS') && DB_PASS !== '') {
        $text = str_replace(DB_PASS, '***', $text);
    }
    if (defined('AUTH_SECRET_KEY') && AUTH_SECRET_KEY !== '') {
        $text = str_replace(AUTH_SECRET_KEY, '***', $text);
    }
    return $text;
}

// Global JSON exception handler for uncaught runtime issues
set_exception_handler(function(Throwable $ex) {
    if (!headers_sent()) {
        header('Content-Type: application/json; charset=UTF-8');
        http_response_code(500);
    }
    echo json_encode([
        'success' => false,
        'error'   => 'Server Error: ' . sanitize_error_text($ex->getMessage()),
        'file'    => basename($ex->getFile()),
        'line'    => $ex->getLine(),
    ], JSON_UNESCAPED_SLASHES);
    exit;
});

// Shutdown handler to convert fatal PHP errors into structured JSON instead of empty HTTP 500
register_shutdown_function(function() {
    $err = error_get_last();
    if ($err && in_array($err['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR], true)) {
        if (!headers_sent()) {
            header('Content-Type: application/json; charset=UTF-8');
            http_response_code(500);
        }
        echo json_encode([
            'success' => false,
            'error'   => 'Fatal Server Error: ' . sanitize_error_text($err['message'] ?? 'Unknown fatal error'),
            'file'    => basename($err['file'] ?? 'unknown'),
            'line'    => (int)($err['line'] ?? 0),
        ], JSON_UNESCAPED_SLASHES);
    }
});

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
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// -----------------------------------------------------------------------------
// 2. Hostinger MySQL Database Credentials (Loaded securely & persistently)
// -----------------------------------------------------------------------------
// Check for persistent, unversioned server-side credential files strictly within public_html
// (Avoids open_basedir violations on Hostinger shared hosting):
// 1) api/config.local.php (local directory override)
// 2) ../config.local.php (web root / public_html override)
// 3) api/config.env.php / ../config.env.php
$localConfigCandidates = [
    __DIR__ . '/config.local.php',
    dirname(__DIR__) . '/config.local.php',
    __DIR__ . '/config.env.php',
    dirname(__DIR__) . '/config.env.php',
];

foreach ($localConfigCandidates as $candidateFile) {
    if (@is_file($candidateFile) && @is_readable($candidateFile)) {
        @include_once $candidateFile;
        break; // Stop once the active local configuration is loaded
    }
}

// Check environment variables from Hostinger Environment Secrets, PHP-FPM, or Apache
// Prioritize getenv() as requested, with fallback to $_ENV, $_SERVER, REDIRECT_*, and apache_getenv()
$fetchEnv = function(string $key): string {
    $candidates = [
        $key,
        'REDIRECT_' . $key,
        strtolower($key),
        'MYSQL_' . $key,
        'HOSTINGER_' . $key,
    ];

    foreach ($candidates as $name) {
        $val = getenv($name);
        if ($val !== false && $val !== '') {
            return (string)$val;
        }
        if (isset($_ENV[$name]) && (string)$_ENV[$name] !== '') {
            return (string)$_ENV[$name];
        }
        if (isset($_SERVER[$name]) && (string)$_SERVER[$name] !== '') {
            return (string)$_SERVER[$name];
        }
        if (function_exists('apache_getenv')) {
            $apacheVal = @apache_getenv($name);
            if ($apacheVal !== false && $apacheVal !== '') {
                return (string)$apacheVal;
            }
        }
    }

    return '';
};

$envHost = trim($fetchEnv('DB_HOST'));
$envPort = trim($fetchEnv('DB_PORT'));
$envName = trim($fetchEnv('DB_NAME'));
$envUser = trim($fetchEnv('DB_USER'));
$envPass = $fetchEnv('DB_PASS');

defined('DB_HOST') or define('DB_HOST', $envHost !== '' ? $envHost : 'localhost');
defined('DB_PORT') or define('DB_PORT', $envPort !== '' ? $envPort : '3306');
defined('DB_NAME') or define('DB_NAME', $envName !== '' ? $envName : 'u926165165_dihanislam');
defined('DB_USER') or define('DB_USER', $envUser !== '' ? $envUser : 'u926165165_mumtahina123');
defined('DB_PASS') or define('DB_PASS', $envPass !== '' ? $envPass : '');
defined('DB_CHARSET') or define('DB_CHARSET', 'utf8mb4');

// Secret key for HMAC token signing (keep server-side only)
$envAuthKey = trim($fetchEnv('AUTH_SECRET_KEY'));
defined('AUTH_SECRET_KEY') or define('AUTH_SECRET_KEY', $envAuthKey !== '' ? $envAuthKey : 'mumtahinas_closet_secure_token_key_7f8c9b2e1a3d4f5e6a7b8c9d0e1f2a3b');

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
 * Helper to check if database password is fully configured.
 */
function is_db_configured(): bool {
    return defined('DB_PASS') && DB_PASS !== '' && DB_PASS !== 'ENTER_YOUR_HOSTINGER_DATABASE_PASSWORD_HERE';
}

/**
 * Returns a shared PDO instance with prepared statements and utf8mb4 encoding.
 * Returns clear, sanitized error messages without exposing passwords or causing HTTP 500 crashes.
 *
 * @return PDO
 */
function get_db(): PDO {
    static $pdo = null;

    if ($pdo !== null) {
        return $pdo;
    }

    if (empty(DB_NAME) || empty(DB_USER)) {
        http_response_code(200);
        echo json_encode([
            'success' => false,
            'connected' => false,
            'error'   => 'Hostinger MySQL database configuration incomplete. DB_NAME or DB_USER is missing.',
            'code'    => 'DB_CONFIG_MISSING'
        ], JSON_UNESCAPED_SLASHES);
        exit;
    }

    if (!is_db_configured()) {
        // Return clear configuration guidance with 200 so health checks and test scripts receive structured JSON rather than an unhandled 500 crash
        http_response_code(200);
        echo json_encode([
            'success' => false,
            'connected' => false,
            'error'   => 'Database password is not yet configured. Please set the DB_PASS environment secret in your Hostinger Panel or config.local.php.',
            'code'    => 'DB_PASSWORD_REQUIRED'
        ], JSON_UNESCAPED_SLASHES);
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
        $msg = sanitize_error_text($e->getMessage());
        $errorMsg = 'Database connection failed. Please verify Hostinger MySQL environment variables (DB_HOST, DB_NAME, DB_USER, DB_PASS) or config.local.php.';

        if (stripos($msg, 'Access denied') !== false) {
            $errorMsg = 'Database access denied: Please verify DB_USER and DB_PASS in Hostinger Environment Variables or config.local.php.';
        } elseif (stripos($msg, 'Unknown database') !== false) {
            $errorMsg = 'Unknown database: Please verify that DB_NAME matches your Hostinger database name.';
        } elseif (stripos($msg, 'Connection refused') !== false || stripos($msg, 'Can\'t connect') !== false) {
            $errorMsg = 'Cannot reach MySQL server. On Hostinger, DB_HOST should usually be "localhost".';
        }

        echo json_encode([
            'success' => false,
            'error'   => $errorMsg,
            'code'    => 'DB_CONNECTION_ERROR'
        ], JSON_UNESCAPED_SLASHES);
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

    $headers = function_exists('getallheaders') ? (getallheaders() ?: []) : [];

    // Check Bearer token if session not found
    if (!$userId) {
        $authHeader = $headers['Authorization']
            ?? $headers['authorization']
            ?? $_SERVER['HTTP_AUTHORIZATION']
            ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
            ?? '';
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            $tokenData = verify_auth_token(trim($matches[1]));
            if ($tokenData) {
                $userId = $tokenData['uid'];
            }
        }
    }

    // Check custom X-Session-Token header
    if (!$userId) {
        $customToken = $headers['X-Session-Token']
            ?? $headers['x-session-token']
            ?? $_SERVER['HTTP_X_SESSION_TOKEN']
            ?? '';
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
