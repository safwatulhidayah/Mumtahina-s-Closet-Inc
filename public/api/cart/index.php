<?php
/**
 * Mumtahina’s Closet Inc - Persistent Cart API
 * Endpoints:
 *   GET    /api/cart/index.php
 *   POST   /api/cart/index.php (Add or update item)
 *   DELETE /api/cart/index.php [?id=...] (Clear or remove item)
 */

require_once __DIR__ . '/../config.php';

$pdo = get_db_connection();
$user = require_authenticated_user($pdo);
$userId = $user['id'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->prepare("
        SELECT c.id, c.product_id, c.selected_size, c.selected_color, c.quantity,
               p.name, p.price, p.original_price, p.images, p.category, p.category_label, p.stock
        FROM cart_items c
        LEFT JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ?
        ORDER BY c.created_at ASC
    ");
    $stmt->execute([$userId]);
    $rows = $stmt->fetchAll();

    $cartItems = array_map(function($r) {
        $images = json_decode($r['images'] ?: '[]', true) ?: [];
        return [
            'id'            => $r['id'],
            'selectedSize'  => $r['selected_size'],
            'selectedColor' => $r['selected_color'],
            'quantity'      => (int)$r['quantity'],
            'product'       => [
                'id'            => $r['product_id'],
                'name'          => $r['name'] ?: 'Modest Piece',
                'price'         => (float)$r['price'],
                'originalPrice' => $r['original_price'] ? (float)$r['original_price'] : null,
                'images'        => $images,
                'category'      => $r['category'] ?: 'women',
                'categoryLabel' => $r['category_label'] ?: 'Women',
                'stock'         => (int)($r['stock'] ?? 10),
            ]
        ];
    }, $rows);

    send_json_response(['success' => true, 'cart' => $cartItems]);
}

if ($method === 'POST') {
    $input = get_json_input();
    $productId = trim($input['productId'] ?? $input['product']['id'] ?? '');
    $selectedSize = trim($input['selectedSize'] ?? $input['size'] ?? 'Standard');
    $selectedColor = trim($input['selectedColor'] ?? $input['color'] ?? 'Original');
    $quantity = max(1, (int)($input['quantity'] ?? 1));

    if (empty($productId)) {
        send_json_response(['success' => false, 'error' => 'Product ID is required'], 400);
    }

    $itemId = $userId . '_' . md5($productId . '_' . $selectedSize . '_' . $selectedColor);

    $stmt = $pdo->prepare("
        INSERT INTO cart_items (id, user_id, product_id, selected_size, selected_color, quantity, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE quantity = ?, updated_at = NOW()
    ");
    $stmt->execute([$itemId, $userId, $productId, $selectedSize, $selectedColor, $quantity, $quantity]);

    send_json_response(['success' => true, 'message' => 'Cart updated', 'itemId' => $itemId]);
}

if ($method === 'DELETE') {
    $itemId = $_GET['id'] ?? null;
    if ($itemId) {
        $stmt = $pdo->prepare("DELETE FROM cart_items WHERE id = ? AND user_id = ?");
        $stmt->execute([$itemId, $userId]);
    } else {
        // Clear entire cart
        $stmt = $pdo->prepare("DELETE FROM cart_items WHERE user_id = ?");
        $stmt->execute([$userId]);
    }

    send_json_response(['success' => true, 'message' => 'Cart item(s) removed']);
}

send_json_response(['success' => false, 'error' => 'Method not allowed'], 405);
