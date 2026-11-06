<?php
/**
 * Mumtahina’s Closet Inc - Products API
 * Endpoints:
 *   GET    /api/products/index.php [?id=... | ?category=... | ?search=...]
 *   POST   /api/products/index.php (Admin only)
 *   PUT    /api/products/index.php (Admin only)
 *   DELETE /api/products/index.php?id=... (Admin only)
 */

require_once __DIR__ . '/../config.php';

$pdo = get_db_connection();
$method = $_SERVER['REQUEST_METHOD'];

// Helper to decode JSON columns safely
function format_product_row(array $row): array {
    return [
        'id'               => $row['id'],
        'productId'        => $row['product_id'] ?: $row['id'],
        'name'             => $row['name'],
        'subtitle'         => $row['subtitle'] ?: '',
        'category'         => $row['category'],
        'categoryLabel'    => $row['category_label'] ?: ucfirst($row['category']),
        'price'            => (float)$row['price'],
        'originalPrice'    => $row['original_price'] !== null ? (float)$row['original_price'] : null,
        'isNew'            => (bool)$row['is_new'],
        'isBestSeller'     => (bool)$row['is_best_seller'],
        'isSale'           => (bool)$row['is_sale'],
        'rating'           => (float)$row['rating'],
        'reviewCount'      => (int)$row['review_count'],
        'images'           => json_decode($row['images'] ?: '[]', true) ?: [],
        'colors'           => json_decode($row['colors'] ?: '[]', true) ?: [],
        'colorNames'       => json_decode($row['color_names'] ?: '[]', true) ?: [],
        'sizes'            => json_decode($row['sizes'] ?: '[]', true) ?: [],
        'description'      => $row['description'],
        'features'         => json_decode($row['features'] ?: '[]', true) ?: [],
        'fabric'           => $row['fabric'] ?: '',
        'careInstructions' => $row['care_instructions'] ?: '',
        'stock'            => (int)$row['stock'],
        'isActive'         => (bool)$row['is_active'],
        'createdAt'        => $row['created_at'],
        'updatedAt'        => $row['updated_at'],
    ];
}

// ----------------------------------------------------------------------------
// GET: Fetch products
// ----------------------------------------------------------------------------
if ($method === 'GET') {
    $id = $_GET['id'] ?? null;
    $category = $_GET['category'] ?? null;
    $search = $_GET['search'] ?? null;

    if ($id) {
        $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ? OR product_id = ? LIMIT 1");
        $stmt->execute([$id, $id]);
        $row = $stmt->fetch();
        if (!$row) {
            send_json_response(['success' => false, 'error' => 'Product not found'], 404);
        }
        send_json_response(['success' => true, 'product' => format_product_row($row)]);
    }

    $currentUser = get_authenticated_user($pdo);
    $isAdmin = $currentUser && (($currentUser['role'] === 'admin') || is_admin_email($currentUser['email']));

    $where = [];
    $params = [];

    // Unless admin, show only active products
    if (!$isAdmin) {
        $where[] = "is_active = 1";
    }

    if ($category && $category !== 'all') {
        $where[] = "category = ?";
        $params[] = $category;
    }

    if (!empty($search)) {
        $where[] = "(name LIKE ? OR subtitle LIKE ? OR description LIKE ? OR category_label LIKE ?)";
        $term = '%' . $search . '%';
        $params[] = $term;
        $params[] = $term;
        $params[] = $term;
        $params[] = $term;
    }

    $whereClause = count($where) > 0 ? "WHERE " . implode(" AND ", $where) : "";
    $sql = "SELECT * FROM products $whereClause ORDER BY is_best_seller DESC, is_new DESC, id ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    $products = array_map('format_product_row', $rows);
    send_json_response(['success' => true, 'products' => $products]);
}

// ----------------------------------------------------------------------------
// POST: Create product (Admin Only)
// ----------------------------------------------------------------------------
if ($method === 'POST') {
    require_admin_user($pdo);

    $input = get_json_input();
    $id = trim($input['id'] ?? $input['productId'] ?? ('mc-' . time()));
    $name = trim($input['name'] ?? '');
    $category = trim($input['category'] ?? 'women');
    $categoryLabel = trim($input['categoryLabel'] ?? ucfirst($category));
    $price = (float)($input['price'] ?? 0);
    $originalPrice = isset($input['originalPrice']) && $input['originalPrice'] !== '' ? (float)$input['originalPrice'] : null;
    $isNew = !empty($input['isNew']) ? 1 : 0;
    $isBestSeller = !empty($input['isBestSeller']) ? 1 : 0;
    $isSale = !empty($input['isSale']) ? 1 : 0;
    $stock = isset($input['stock']) ? (int)$input['stock'] : 10;
    $description = trim($input['description'] ?? '');
    $fabric = trim($input['fabric'] ?? '');
    $care = trim($input['careInstructions'] ?? '');
    $subtitle = trim($input['subtitle'] ?? '');

    if (empty($name)) {
        send_json_response(['success' => false, 'error' => 'Product title is required'], 400);
    }

    $imagesJson = json_encode(is_array($input['images'] ?? null) ? $input['images'] : []);
    $colorsJson = json_encode(is_array($input['colors'] ?? null) ? $input['colors'] : []);
    $colorNamesJson = json_encode(is_array($input['colorNames'] ?? null) ? $input['colorNames'] : []);
    $sizesJson = json_encode(is_array($input['sizes'] ?? null) ? $input['sizes'] : ['Standard']);
    $featuresJson = json_encode(is_array($input['features'] ?? null) ? $input['features'] : []);

    $stmt = $pdo->prepare("
        INSERT INTO products (
            id, product_id, name, subtitle, category, category_label,
            price, original_price, is_new, is_best_seller, is_sale,
            images, colors, color_names, sizes, description, features,
            fabric, care_instructions, stock, is_active, created_at
        ) VALUES (
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, 1, NOW()
        )
    ");

    $stmt->execute([
        $id, $id, $name, $subtitle, $category, $categoryLabel,
        $price, $originalPrice, $isNew, $isBestSeller, $isSale,
        $imagesJson, $colorsJson, $colorNamesJson, $sizesJson, $description, $featuresJson,
        $fabric, $care, $stock
    ]);

    $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
    $stmt->execute([$id]);
    $newRow = $stmt->fetch();

    send_json_response([
        'success' => true,
        'message' => 'Product created successfully',
        'product' => format_product_row($newRow)
    ], 201);
}

// ----------------------------------------------------------------------------
// PUT: Update product (Admin Only)
// ----------------------------------------------------------------------------
if ($method === 'PUT') {
    require_admin_user($pdo);

    $input = get_json_input();
    $id = trim($input['id'] ?? $input['productId'] ?? ($_GET['id'] ?? ''));

    if (empty($id)) {
        send_json_response(['success' => false, 'error' => 'Product ID is required for update'], 400);
    }

    $name = trim($input['name'] ?? '');
    $category = trim($input['category'] ?? 'women');
    $categoryLabel = trim($input['categoryLabel'] ?? ucfirst($category));
    $price = (float)($input['price'] ?? 0);
    $originalPrice = isset($input['originalPrice']) && $input['originalPrice'] !== '' ? (float)$input['originalPrice'] : null;
    $isNew = !empty($input['isNew']) ? 1 : 0;
    $isBestSeller = !empty($input['isBestSeller']) ? 1 : 0;
    $isSale = !empty($input['isSale']) ? 1 : 0;
    $stock = isset($input['stock']) ? (int)$input['stock'] : 10;
    $description = trim($input['description'] ?? '');
    $fabric = trim($input['fabric'] ?? '');
    $care = trim($input['careInstructions'] ?? '');
    $subtitle = trim($input['subtitle'] ?? '');
    $isActive = isset($input['isActive']) ? ($input['isActive'] ? 1 : 0) : 1;

    $imagesJson = json_encode(is_array($input['images'] ?? null) ? $input['images'] : []);
    $colorsJson = json_encode(is_array($input['colors'] ?? null) ? $input['colors'] : []);
    $colorNamesJson = json_encode(is_array($input['colorNames'] ?? null) ? $input['colorNames'] : []);
    $sizesJson = json_encode(is_array($input['sizes'] ?? null) ? $input['sizes'] : ['Standard']);
    $featuresJson = json_encode(is_array($input['features'] ?? null) ? $input['features'] : []);

    $stmt = $pdo->prepare("
        UPDATE products SET
            name = ?, subtitle = ?, category = ?, category_label = ?,
            price = ?, original_price = ?, is_new = ?, is_best_seller = ?, is_sale = ?,
            images = ?, colors = ?, color_names = ?, sizes = ?, description = ?, features = ?,
            fabric = ?, care_instructions = ?, stock = ?, is_active = ?
        WHERE id = ? OR product_id = ?
    ");

    $stmt->execute([
        $name, $subtitle, $category, $categoryLabel,
        $price, $originalPrice, $isNew, $isBestSeller, $isSale,
        $imagesJson, $colorsJson, $colorNamesJson, $sizesJson, $description, $featuresJson,
        $fabric, $care, $stock, $isActive,
        $id, $id
    ]);

    $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ? OR product_id = ?");
    $stmt->execute([$id, $id]);
    $updatedRow = $stmt->fetch();

    send_json_response([
        'success' => true,
        'message' => 'Product updated successfully',
        'product' => format_product_row($updatedRow)
    ]);
}

// ----------------------------------------------------------------------------
// DELETE: Remove product (Admin Only)
// ----------------------------------------------------------------------------
if ($method === 'DELETE') {
    require_admin_user($pdo);

    $id = $_GET['id'] ?? null;
    if (!$id) {
        $input = get_json_input();
        $id = $input['id'] ?? null;
    }

    if (empty($id)) {
        send_json_response(['success' => false, 'error' => 'Product ID required for deletion'], 400);
    }

    $stmt = $pdo->prepare("DELETE FROM products WHERE id = ? OR product_id = ?");
    $stmt->execute([$id, $id]);

    send_json_response([
        'success' => true,
        'message' => 'Product deleted successfully',
        'id'      => $id
    ]);
}

send_json_response(['success' => false, 'error' => 'Unsupported method'], 405);
