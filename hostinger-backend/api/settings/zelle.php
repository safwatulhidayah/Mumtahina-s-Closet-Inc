<?php
/**
 * Mumtahina’s Closet Inc - Zelle Payment Settings API
 * Endpoints:
 *   GET  /api/settings/zelle.php (Public read for checkout instructions & QR code)
 *   POST /api/settings/zelle.php (Admin update)
 *   PUT  /api/settings/zelle.php (Admin update)
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth_helper.php';

$pdo = get_db_connection();
$method = $_SERVER['REQUEST_METHOD'];

// Ensure default row exists
$pdo->exec("
    INSERT INTO zelle_settings (id, account_holder_name, phone, email, qr_code_url, payment_url, payment_instructions, updated_at)
    VALUES (
        1,
        'Dilruba Shabnam',
        '914-303-9181',
        'clientshabnamusa@gmail.com',
        'https://cdn.phototourl.com/member/2026-09-29-15445970-229c-41bd-9aaf-dc85f6d6e352.jpg',
        'https://enroll.zellepay.com/qr-codes?data=eyJhY3Rpb24iOiJwYXltZW50IiwibmFtZSI6IkRpbHJ1YmEgU2hhYm5hbSIsInRva2VuIjoiOTE0MzAzOTE4MSJ9',
        'Please scan the Zelle QR code or send payment to 914-303-9181 (Dilruba Shabnam). Once sent, enter your Zelle confirmation/transaction number below. Our atelier will verify your payment and process your order immediately.',
        NOW()
    ) ON DUPLICATE KEY UPDATE id=1
");

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM zelle_settings WHERE id = 1 LIMIT 1");
    $settings = $stmt->fetch();

    send_json_response([
        'success'  => true,
        'settings' => [
            'accountHolderName'   => $settings['account_holder_name'],
            'phone'               => $settings['phone'],
            'email'               => $settings['email'],
            'qrCodeUrl'           => $settings['qr_code_url'],
            'paymentUrl'          => $settings['payment_url'],
            'paymentInstructions' => $settings['payment_instructions'],
            'updatedAt'           => $settings['updated_at'],
        ]
    ]);
}

if ($method === 'POST' || $method === 'PUT') {
    require_admin_user($pdo);

    $input = get_json_input();
    $name = trim($input['accountHolderName'] ?? 'Dilruba Shabnam');
    $phone = trim($input['phone'] ?? '914-303-9181');
    $email = trim($input['email'] ?? 'clientshabnamusa@gmail.com');
    $qrUrl = trim($input['qrCodeUrl'] ?? '');
    $paymentUrl = trim($input['paymentUrl'] ?? '');
    $instructions = trim($input['paymentInstructions'] ?? '');

    $stmt = $pdo->prepare("
        UPDATE zelle_settings SET
            account_holder_name = ?,
            phone = ?,
            email = ?,
            qr_code_url = ?,
            payment_url = ?,
            payment_instructions = ?,
            updated_at = NOW()
        WHERE id = 1
    ");
    $stmt->execute([$name, $phone, $email, $qrUrl, $paymentUrl, $instructions]);

    $stmt = $pdo->query("SELECT * FROM zelle_settings WHERE id = 1 LIMIT 1");
    $updated = $stmt->fetch();

    send_json_response([
        'success'  => true,
        'message'  => 'Zelle payment settings updated successfully',
        'settings' => [
            'accountHolderName'   => $updated['account_holder_name'],
            'phone'               => $updated['phone'],
            'email'               => $updated['email'],
            'qrCodeUrl'           => $updated['qr_code_url'],
            'paymentUrl'          => $updated['payment_url'],
            'paymentInstructions' => $updated['payment_instructions'],
            'updatedAt'           => $updated['updated_at'],
        ]
    ]);
}

send_json_response(['success' => false, 'error' => 'Method not allowed'], 405);
