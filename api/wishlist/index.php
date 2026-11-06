<?php
/**
 * Mumtahina’s Closet Inc - Wishlist API
 * Endpoints:
 *   GET    /api/wishlist/index.php
 *   POST   /api/wishlist/index.php (Toggles product in wishlist)
 *   DELETE /api/wishlist/index.php?productId=...
 */

require_once __DIR__ . '/../config.php';

$pdo = get_db_connection();
$user = require_authenticated_user($pdo);
$userId = $user['id'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->prepare("
        SELECT p.*
        FROM wishlists w
        JOIN products p ON w.product_id = p.id
        WHERE w.user_id = ?
        ORDER BY w.created_at DESC
    ");
    $stmt->execute([$userId]);
    $rows = $stmt->fetchAll();

    $wishlist = array_map(function($row) {
        return [
            'id'            => $row['id'],
            'name'          => $row['name'],
            'subtitle'      => $row['subtitle'] ?: '',
            'category'      => $row['category'],
            'categoryLabel' => $row['category_label'] ?: ucfirst($row['category']),
            'price'         => (float)$row['price'],
            'originalPrice' => $row['original_price'] !== null ? (float)$row['original_price'] : null,
            'isNew'         => (bool)$row['is_new'],
            'isBestSeller'  => (bool)$row['is_best_seller'],
            'isSale'        => (bool)$row['is_sale'],
            'rating'        => (float)$row['rating'],
            'reviewCount'   => (int)$row['review_count'],
            'images'        => json_decode($row['images'] ?: '[]', true) ?: [],
            'colors'        => json_decode($row['colors'] ?: '[]', true) ?: [],
            'colorNames'    => json_decode($row['color_names'] ?: '[]', true) ?: [],
            'sizes'         => json_decode($row['sizes'] ?: '[]', true) ?: [],
            'description'   => $row['description'],
            'features'      => json_decode($row['features'] ?: '[]', true) ?: [],
            'fabric'        => $row['fabric'] ?: '',
            'stock'         => (int)$row['stock'],
        ];
    }, $rows);

    send_json_response(['success' => true, 'wishlist' => $wishlist]);
}

if ($method === 'POST') {
    $input = get_json_input();
    $productId = trim($input['productId'] ?? $input['id'] ?? '');

    if (empty($productId)) {
        send_json_response(['success' => false, 'error' => 'Product ID is required'], 400);
    }

    // Check if exists
    $check = $pdo->prepare("SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?");
    $check->execute([$userId, $productId]);
    $existing = $check->fetch();

    if ($existing) {
        $del = $pdo->prepare("DELETE FROM wishlists WHERE user_id = ? AND product_id = ?");
        $del->execute([$userId, $productId]);
        send_json_response(['success' => true, 'isWishlisted' => false, 'message' => 'Removed from wishlist']);
    } else {
        $ins = $pdo->prepare("INSERT INTO wishlists (user_id, product_id, created_at) VALUES (?, ?, NOW())");
        $ins->execute([$userId, $productId]);
        send_json_response(['success' => true, 'isWishlisted' => true, 'message' => 'Added to wishlist']);
    }
}

if ($method === 'DELETE') {
    $productId = $_GET['productId'] ?? $_GET['id'] ?? null;
    if ($productId) {
        $del = $pdo->prepare("DELETE FROM wishlists WHERE user_id = ? AND product_id = ?");
        $del->execute([$userId, $productId]);
    }
    send_json_response(['success' => true, 'message' => 'Wishlist updated']);
}

send_json_response(['success' => false, 'error' => 'Method not allowed'], 405);
