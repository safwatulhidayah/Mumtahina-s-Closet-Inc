<?php
/**
 * Mumtahina’s Closet Inc - Secure Clear Products & Orders Endpoint
 * Endpoint: POST /api/admin/clear-data.php
 *
 * Strictly deletes:
 * 1. order_items
 * 2. orders
 * 3. cart_items
 * 4. wishlists
 * 5. reviews (related to products)
 * 6. products
 *
 * Preserves completely:
 * - categories
 * - users & admin accounts
 * - zelle_settings
 * - website_settings
 * - shipping_addresses
 * - password_resets
 *
 * Requires administrative authorization.
 */

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json_response(['success' => false, 'error' => 'Method not allowed'], 405);
}

$pdo = get_db_connection();
require_admin_user($pdo);

try {
    // 1. Report counts before deletion
    $countProducts = (int)$pdo->query("SELECT COUNT(*) FROM products")->fetchColumn();
    $countOrders = (int)$pdo->query("SELECT COUNT(*) FROM orders")->fetchColumn();
    $countOrderItems = (int)$pdo->query("SELECT COUNT(*) FROM order_items")->fetchColumn();
    $countCartItems = (int)$pdo->query("SELECT COUNT(*) FROM cart_items")->fetchColumn();
    $countWishlists = (int)$pdo->query("SELECT COUNT(*) FROM wishlists")->fetchColumn();
    $countReviews = (int)$pdo->query("SELECT COUNT(*) FROM reviews")->fetchColumn();

    $beforeCounts = [
        'products'    => $countProducts,
        'orders'      => $countOrders,
        'order_items' => $countOrderItems,
        'cart_items'  => $countCartItems,
        'wishlists'   => $countWishlists,
        'reviews'     => $countReviews,
    ];

    // 2. Execute safe transactional deletion
    $pdo->beginTransaction();

    // Disable foreign key checks temporarily for atomic truncation/deletion
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");

    $pdo->exec("DELETE FROM order_items");
    $pdo->exec("DELETE FROM orders");
    $pdo->exec("DELETE FROM cart_items");
    $pdo->exec("DELETE FROM wishlists");
    $pdo->exec("DELETE FROM reviews");
    $pdo->exec("DELETE FROM products");

    // Re-enable foreign key checks
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");

    $pdo->commit();

    // 3. Verify counts after deletion
    $afterProducts = (int)$pdo->query("SELECT COUNT(*) FROM products")->fetchColumn();
    $afterOrders = (int)$pdo->query("SELECT COUNT(*) FROM orders")->fetchColumn();
    $afterOrderItems = (int)$pdo->query("SELECT COUNT(*) FROM order_items")->fetchColumn();
    $afterCartItems = (int)$pdo->query("SELECT COUNT(*) FROM cart_items")->fetchColumn();
    $afterWishlists = (int)$pdo->query("SELECT COUNT(*) FROM wishlists")->fetchColumn();
    $afterReviews = (int)$pdo->query("SELECT COUNT(*) FROM reviews")->fetchColumn();

    $afterCounts = [
        'products'    => $afterProducts,
        'orders'      => $afterOrders,
        'order_items' => $afterOrderItems,
        'cart_items'  => $afterCartItems,
        'wishlists'   => $afterWishlists,
        'reviews'     => $afterReviews,
    ];

    // Verify preserved entities
    $remainingCategories = (int)$pdo->query("SELECT COUNT(*) FROM categories")->fetchColumn();
    $remainingUsers = (int)$pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();

    send_json_response([
        'success'           => true,
        'message'           => 'Products and customer order data cleared permanently.',
        'before_deletion'   => $beforeCounts,
        'after_deletion'    => $afterCounts,
        'preserved'         => [
            'categories' => $remainingCategories,
            'users'      => $remainingUsers,
            'tables'     => 13,
        ],
        'is_empty'          => ($afterProducts === 0 && $afterOrders === 0 && $afterOrderItems === 0),
    ], 200);

} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    // Ensure foreign key checks re-enabled on error
    try {
        $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
    } catch (Throwable $ignored) {}

    send_json_response([
        'success' => false,
        'error'   => 'Failed to clear data: ' . $e->getMessage(),
    ], 500);
}
