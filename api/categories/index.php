<?php
/**
 * Mumtahina’s Closet Inc - Categories API
 * Endpoints:
 *   GET    /api/categories/index.php
 *   POST   /api/categories/index.php (Admin only)
 *   PUT    /api/categories/index.php (Admin only)
 *   DELETE /api/categories/index.php?id=... (Admin only)
 */

require_once __DIR__ . '/../config.php';

$pdo = get_db_connection();
$method = $_SERVER['REQUEST_METHOD'];

function format_category_row(array $row): array {
    return [
        'id'          => $row['id'],
        'categoryId'  => $row['id'],
        'slug'        => $row['slug'],
        'nameEn'      => $row['name_en'],
        'nameBn'      => $row['name_bn'] ?: '',
        'description' => $row['description'] ?: '',
        'image'       => $row['image'],
        'itemCount'   => (int)$row['item_count'],
        'isActive'    => (bool)$row['is_active'],
        'status'      => $row['status'] ?: 'active',
        'featured'    => (bool)$row['featured'],
        'createdAt'   => $row['created_at'],
        'updatedAt'   => $row['updated_at'],
    ];
}

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM categories ORDER BY featured DESC, name_en ASC");
    $rows = $stmt->fetchAll();
    $categories = array_map('format_category_row', $rows);
    send_json_response(['success' => true, 'categories' => $categories]);
}

if ($method === 'POST') {
    require_admin_user($pdo);

    $input = get_json_input();
    $id = trim($input['id'] ?? ('cat-' . time()));
    $slug = strtolower(trim($input['slug'] ?? ''));
    $nameEn = trim($input['nameEn'] ?? '');
    $nameBn = trim($input['nameBn'] ?? '');
    $description = trim($input['description'] ?? '');
    $image = trim($input['image'] ?? '');
    $itemCount = (int)($input['itemCount'] ?? 0);
    $isActive = isset($input['isActive']) ? ($input['isActive'] ? 1 : 0) : 1;
    $status = trim($input['status'] ?? 'active');
    $featured = !empty($input['featured']) ? 1 : 0;

    if (empty($nameEn)) {
        send_json_response(['success' => false, 'error' => 'Category name is required'], 400);
    }
    if (empty($slug)) {
        $slug = preg_replace('/[^a-z0-9]+/i', '-', strtolower($nameEn));
    }

    $stmt = $pdo->prepare("
        INSERT INTO categories (id, slug, name_en, name_bn, description, image, item_count, is_active, status, featured, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    $stmt->execute([$id, $slug, $nameEn, $nameBn, $description, $image, $itemCount, $isActive, $status, $featured]);

    $stmt = $pdo->prepare("SELECT * FROM categories WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch();

    send_json_response(['success' => true, 'category' => format_category_row($row)], 201);
}

if ($method === 'PUT') {
    require_admin_user($pdo);

    $input = get_json_input();
    $id = trim($input['id'] ?? ($_GET['id'] ?? ''));

    if (empty($id)) {
        send_json_response(['success' => false, 'error' => 'Category ID required for update'], 400);
    }

    $slug = strtolower(trim($input['slug'] ?? ''));
    $nameEn = trim($input['nameEn'] ?? '');
    $nameBn = trim($input['nameBn'] ?? '');
    $description = trim($input['description'] ?? '');
    $image = trim($input['image'] ?? '');
    $itemCount = (int)($input['itemCount'] ?? 0);
    $isActive = isset($input['isActive']) ? ($input['isActive'] ? 1 : 0) : 1;
    $status = trim($input['status'] ?? 'active');
    $featured = !empty($input['featured']) ? 1 : 0;

    $stmt = $pdo->prepare("
        UPDATE categories SET
            slug = ?, name_en = ?, name_bn = ?, description = ?,
            image = ?, item_count = ?, is_active = ?, status = ?, featured = ?
        WHERE id = ?
    ");
    $stmt->execute([$slug, $nameEn, $nameBn, $description, $image, $itemCount, $isActive, $status, $featured, $id]);

    $stmt = $pdo->prepare("SELECT * FROM categories WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch();

    send_json_response(['success' => true, 'category' => format_category_row($row)]);
}

if ($method === 'DELETE') {
    require_admin_user($pdo);

    $id = $_GET['id'] ?? null;
    if (!$id) {
        $input = get_json_input();
        $id = $input['id'] ?? null;
    }

    if (empty($id)) {
        send_json_response(['success' => false, 'error' => 'Category ID required for deletion'], 400);
    }

    $stmt = $pdo->prepare("DELETE FROM categories WHERE id = ?");
    $stmt->execute([$id]);

    send_json_response(['success' => true, 'message' => 'Category deleted', 'id' => $id]);
}

send_json_response(['success' => false, 'error' => 'Method not allowed'], 405);
