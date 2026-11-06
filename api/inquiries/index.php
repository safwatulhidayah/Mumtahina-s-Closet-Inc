<?php
/**
 * Mumtahina’s Closet Inc - Customer Inquiries / Contact API
 * Endpoints:
 *   GET    /api/inquiries/index.php (Admin only)
 *   POST   /api/inquiries/index.php (Public form submission)
 *   PUT    /api/inquiries/index.php (Admin status update)
 *   DELETE /api/inquiries/index.php?id=... (Admin only)
 */

require_once __DIR__ . '/../config.php';

$pdo = get_db_connection();
$method = $_SERVER['REQUEST_METHOD'];

function format_inquiry(array $r): array {
    return [
        'id'           => $r['id'],
        'inquiryId'    => $r['id'],
        'name'         => $r['name'],
        'customerName' => $r['customer_name'] ?: $r['name'],
        'email'        => $r['email'],
        'phone'        => $r['phone'] ?: '',
        'subject'      => $r['subject'],
        'type'         => $r['type'] ?: $r['subject'],
        'message'      => $r['message'],
        'status'       => $r['status'],
        'createdAt'    => $r['created_at'],
        'updatedAt'    => $r['updated_at'],
    ];
}

if ($method === 'GET') {
    require_admin_user($pdo);

    $stmt = $pdo->query("SELECT * FROM inquiries ORDER BY created_at DESC");
    $rows = $stmt->fetchAll();
    send_json_response(['success' => true, 'inquiries' => array_map('format_inquiry', $rows)]);
}

if ($method === 'POST') {
    $input = get_json_input();
    $id = trim($input['id'] ?? ('inq-' . time() . '-' . substr(uniqid(), -4)));
    $name = trim($input['name'] ?? $input['customerName'] ?? '');
    $email = strtolower(trim($input['email'] ?? ''));
    $phone = trim($input['phone'] ?? '');
    $subject = trim($input['subject'] ?? $input['type'] ?? 'General Inquiry');
    $type = trim($input['type'] ?? $subject);
    $message = trim($input['message'] ?? '');
    $status = trim($input['status'] ?? 'New');

    if (empty($name) || empty($email) || empty($message)) {
        send_json_response(['success' => false, 'error' => 'Name, email, and message are required'], 400);
    }

    $stmt = $pdo->prepare("
        INSERT INTO inquiries (id, name, customer_name, email, phone, subject, type, message, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    $stmt->execute([$id, $name, $name, $email, $phone, $subject, $type, $message, $status]);

    $stmt = $pdo->prepare("SELECT * FROM inquiries WHERE id = ?");
    $stmt->execute([$id]);
    $created = $stmt->fetch();

    send_json_response([
        'success'   => true,
        'message'   => 'Thank you! Your inquiry has been received. Our concierge will be in touch shortly.',
        'inquiryId' => $id,
        'inquiry'   => format_inquiry($created)
    ], 201);
}

if ($method === 'PUT') {
    require_admin_user($pdo);

    $input = get_json_input();
    $id = trim($input['id'] ?? ($_GET['id'] ?? ''));
    $status = trim($input['status'] ?? 'In Review');

    if (empty($id)) {
        send_json_response(['success' => false, 'error' => 'Inquiry ID required'], 400);
    }

    $stmt = $pdo->prepare("UPDATE inquiries SET status = ? WHERE id = ?");
    $stmt->execute([$status, $id]);

    $stmt = $pdo->prepare("SELECT * FROM inquiries WHERE id = ?");
    $stmt->execute([$id]);
    $updated = $stmt->fetch();

    send_json_response(['success' => true, 'inquiry' => format_inquiry($updated)]);
}

if ($method === 'DELETE') {
    require_admin_user($pdo);

    $id = $_GET['id'] ?? null;
    if ($id) {
        $stmt = $pdo->prepare("DELETE FROM inquiries WHERE id = ?");
        $stmt->execute([$id]);
    }
    send_json_response(['success' => true, 'message' => 'Inquiry deleted', 'id' => $id]);
}

send_json_response(['success' => false, 'error' => 'Method not allowed'], 405);
