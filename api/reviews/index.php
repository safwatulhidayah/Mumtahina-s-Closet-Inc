<?php
/**
 * Mumtahina’s Closet Inc - Reviews API
 * Endpoints:
 *   GET    /api/reviews/index.php [?productId=...]
 *   POST   /api/reviews/index.php (Submit review)
 *   PUT    /api/reviews/index.php (Admin status update)
 *   DELETE /api/reviews/index.php?id=... (Admin only)
 */

require_once __DIR__ . '/../config.php';

$pdo = get_db_connection();
$method = $_SERVER['REQUEST_METHOD'];

function format_review(array $r): array {
    return [
        'id'           => $r['id'],
        'reviewId'     => $r['id'],
        'productId'    => $r['product_id'] ?: '',
        'customerId'   => $r['customer_id'] ?: '',
        'customerName' => $r['customer_name'],
        'userName'     => $r['user_name'] ?: $r['customer_name'],
        'rating'       => (float)$r['rating'],
        'title'        => $r['title'] ?: '',
        'comment'      => $r['comment'],
        'verified'     => (bool)$r['verified'],
        'fitFeedback'  => $r['fit_feedback'] ?: '',
        'status'       => $r['status'],
        'createdAt'    => $r['created_at'],
        'date'         => date('M d, Y', strtotime($r['created_at'])),
    ];
}

if ($method === 'GET') {
    $currentUser = get_authenticated_user($pdo);
    $isAdmin = $currentUser && (($currentUser['role'] === 'admin') || is_admin_email($currentUser['email']));

    $productId = $_GET['productId'] ?? null;
    $where = [];
    $params = [];

    if (!$isAdmin) {
        $where[] = "status = 'approved'";
    }

    if ($productId) {
        $where[] = "product_id = ?";
        $params[] = $productId;
    }

    $whereSql = count($where) > 0 ? "WHERE " . implode(" AND ", $where) : "";
    $stmt = $pdo->prepare("SELECT * FROM reviews $whereSql ORDER BY created_at DESC");
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    send_json_response(['success' => true, 'reviews' => array_map('format_review', $rows)]);
}

if ($method === 'POST') {
    $input = get_json_input();
    $id = trim($input['id'] ?? ('rev-' . time()));
    $productId = trim($input['productId'] ?? '');
    $customerName = trim($input['customerName'] ?? $input['userName'] ?? 'Valued Client');
    $rating = max(1.0, min(5.0, (float)($input['rating'] ?? 5.0)));
    $title = trim($input['title'] ?? 'Exquisite quality');
    $comment = trim($input['comment'] ?? '');
    $verified = isset($input['verified']) ? ($input['verified'] ? 1 : 0) : 1;
    $fitFeedback = trim($input['fitFeedback'] ?? '');
    $status = trim($input['status'] ?? 'approved');

    if (empty($comment)) {
        send_json_response(['success' => false, 'error' => 'Review comment is required'], 400);
    }

    $currentUser = get_authenticated_user($pdo);
    $customerId = $currentUser ? $currentUser['id'] : trim($input['customerId'] ?? '');

    $stmt = $pdo->prepare("
        INSERT INTO reviews (id, product_id, customer_id, customer_name, user_name, rating, title, comment, verified, fit_feedback, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    $stmt->execute([$id, $productId, $customerId, $customerName, $customerName, $rating, $title, $comment, $verified, $fitFeedback, $status]);

    // Recalculate product rating if productId is provided
    if ($productId) {
        $calcStmt = $pdo->prepare("SELECT AVG(rating) as avg_rating, COUNT(id) as count_rev FROM reviews WHERE product_id = ? AND status = 'approved'");
        $calcStmt->execute([$productId]);
        $calc = $calcStmt->fetch();
        if ($calc) {
            $upProd = $pdo->prepare("UPDATE products SET rating = ?, review_count = ? WHERE id = ?");
            $upProd->execute([round((float)$calc['avg_rating'], 2), (int)$calc['count_rev'], $productId]);
        }
    }

    $stmt = $pdo->prepare("SELECT * FROM reviews WHERE id = ?");
    $stmt->execute([$id]);
    $created = $stmt->fetch();

    send_json_response(['success' => true, 'message' => 'Review submitted', 'review' => format_review($created)], 201);
}

if ($method === 'PUT') {
    require_admin_user($pdo);

    $input = get_json_input();
    $id = trim($input['id'] ?? ($_GET['id'] ?? ''));
    $status = trim($input['status'] ?? 'approved');

    if (empty($id)) {
        send_json_response(['success' => false, 'error' => 'Review ID required'], 400);
    }

    $stmt = $pdo->prepare("UPDATE reviews SET status = ? WHERE id = ?");
    $stmt->execute([$status, $id]);

    $stmt = $pdo->prepare("SELECT * FROM reviews WHERE id = ?");
    $stmt->execute([$id]);
    $updated = $stmt->fetch();

    send_json_response(['success' => true, 'review' => format_review($updated)]);
}

if ($method === 'DELETE') {
    require_admin_user($pdo);

    $id = $_GET['id'] ?? null;
    if ($id) {
        $stmt = $pdo->prepare("DELETE FROM reviews WHERE id = ?");
        $stmt->execute([$id]);
    }
    send_json_response(['success' => true, 'message' => 'Review deleted', 'id' => $id]);
}

send_json_response(['success' => false, 'error' => 'Method not allowed'], 405);
