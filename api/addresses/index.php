<?php
/**
 * Mumtahina’s Closet Inc - Shipping Addresses API
 * Endpoints:
 *   GET    /api/addresses/index.php
 *   POST   /api/addresses/index.php
 *   PUT    /api/addresses/index.php
 *   DELETE /api/addresses/index.php?id=...
 */

require_once __DIR__ . '/../config.php';

$pdo = get_db_connection();
$user = require_authenticated_user($pdo);
$userId = $user['id'];
$method = $_SERVER['REQUEST_METHOD'];

function format_address(array $r): array {
    return [
        'id'        => $r['id'],
        'title'     => $r['title'],
        'street'    => $r['street'],
        'city'      => $r['city'],
        'state'     => $r['state'],
        'zip'       => $r['zip'],
        'isDefault' => (bool)$r['is_default'],
        'createdAt' => $r['created_at'],
        'updatedAt' => $r['updated_at'],
    ];
}

if ($method === 'GET') {
    $stmt = $pdo->prepare("SELECT * FROM shipping_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC");
    $stmt->execute([$userId]);
    $rows = $stmt->fetchAll();
    send_json_response(['success' => true, 'addresses' => array_map('format_address', $rows)]);
}

if ($method === 'POST') {
    $input = get_json_input();
    $id = trim($input['id'] ?? ('addr-' . time()));
    $title = trim($input['title'] ?? 'Home');
    $street = trim($input['street'] ?? '');
    $city = trim($input['city'] ?? '');
    $state = trim($input['state'] ?? 'TX');
    $zip = trim($input['zip'] ?? '');
    $isDefault = !empty($input['isDefault']) ? 1 : 0;

    if (empty($street) || empty($city) || empty($zip)) {
        send_json_response(['success' => false, 'error' => 'Street, city, and ZIP code are required'], 400);
    }

    if ($isDefault) {
        $clearDefault = $pdo->prepare("UPDATE shipping_addresses SET is_default = 0 WHERE user_id = ?");
        $clearDefault->execute([$userId]);
    }

    $stmt = $pdo->prepare("
        INSERT INTO shipping_addresses (id, user_id, title, street, city, state, zip, is_default, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    $stmt->execute([$id, $userId, $title, $street, $city, $state, $zip, $isDefault]);

    $stmt = $pdo->prepare("SELECT * FROM shipping_addresses WHERE id = ?");
    $stmt->execute([$id]);
    $created = $stmt->fetch();

    send_json_response(['success' => true, 'address' => format_address($created)], 201);
}

if ($method === 'PUT') {
    $input = get_json_input();
    $id = trim($input['id'] ?? ($_GET['id'] ?? ''));

    if (empty($id)) {
        send_json_response(['success' => false, 'error' => 'Address ID required'], 400);
    }

    $title = trim($input['title'] ?? 'Home');
    $street = trim($input['street'] ?? '');
    $city = trim($input['city'] ?? '');
    $state = trim($input['state'] ?? 'TX');
    $zip = trim($input['zip'] ?? '');
    $isDefault = !empty($input['isDefault']) ? 1 : 0;

    if ($isDefault) {
        $clearDefault = $pdo->prepare("UPDATE shipping_addresses SET is_default = 0 WHERE user_id = ?");
        $clearDefault->execute([$userId]);
    }

    $stmt = $pdo->prepare("
        UPDATE shipping_addresses SET
            title = ?, street = ?, city = ?, state = ?, zip = ?, is_default = ?
        WHERE id = ? AND user_id = ?
    ");
    $stmt->execute([$title, $street, $city, $state, $zip, $isDefault, $id, $userId]);

    $stmt = $pdo->prepare("SELECT * FROM shipping_addresses WHERE id = ?");
    $stmt->execute([$id]);
    $updated = $stmt->fetch();

    send_json_response(['success' => true, 'address' => format_address($updated)]);
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if ($id) {
        $stmt = $pdo->prepare("DELETE FROM shipping_addresses WHERE id = ? AND user_id = ?");
        $stmt->execute([$id, $userId]);
    }
    send_json_response(['success' => true, 'message' => 'Address deleted', 'id' => $id]);
}

send_json_response(['success' => false, 'error' => 'Method not allowed'], 405);
