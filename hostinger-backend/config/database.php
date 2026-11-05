<?php
/**
 * Mumtahina’s Closet Inc - Database Connection (Hostinger PDO)
 *
 * Configures a secure, persistent connection to the Hostinger MySQL database.
 * Credentials can be set directly below or loaded from an environment file.
 */

// Load custom env configuration if present
$envFile = __DIR__ . '/config.env.php';
if (file_exists($envFile)) {
    require_once $envFile;
}

// Hostinger MySQL Credentials (Configured in config.env.php or environment)
defined('DB_HOST') or define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
defined('DB_PORT') or define('DB_PORT', getenv('DB_PORT') ?: '3306');
defined('DB_NAME') or define('DB_NAME', getenv('DB_NAME') ?: '');
defined('DB_USER') or define('DB_USER', getenv('DB_USER') ?: '');
defined('DB_PASS') or define('DB_PASS', getenv('DB_PASS') ?: '');
defined('DB_CHARSET') or define('DB_CHARSET', 'utf8mb4');

/**
 * Returns a shared PDO instance with robust error handling and prepared statement enforcement.
 *
 * @return PDO
 */
function get_db_connection(): PDO {
    static $pdo = null;

    if ($pdo !== null) {
        return $pdo;
    }

    if (empty(DB_NAME) || empty(DB_USER)) {
        http_response_code(500);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode([
            'success' => false,
            'error'   => 'Hostinger MySQL database credentials are not configured. Please create config/config.env.php with your actual DB credentials.',
            'code'    => 'DB_CONFIG_MISSING'
        ]);
        exit;
    }

    $dsn = sprintf(
        'mysql:host=%s;port=%s;dbname=%s;charset=%s',
        DB_HOST,
        DB_PORT,
        DB_NAME,
        DB_CHARSET
    );

    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false, // True prepared statements
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
        PDO::ATTR_TIMEOUT            => 5,
    ];

    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
    } catch (PDOException $e) {
        // Return a clean, non-leaking error response
        http_response_code(500);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode([
            'success' => false,
            'error'   => 'Database connection failed. Please verify Hostinger MySQL credentials in config/config.env.php.',
            'code'    => 'DB_CONNECTION_ERROR'
        ]);
        exit;
    }
}
