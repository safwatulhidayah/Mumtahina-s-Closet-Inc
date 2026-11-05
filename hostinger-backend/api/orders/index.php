<?php
/**
 * Mumtahina’s Closet Inc - Orders & Zelle Payment Processing API
 * Endpoints:
 *   GET  /api/orders/index.php [?id=...]
 *   POST /api/orders/index.php (Creates order with mandatory Zelle reference)
 *   PUT  /api/orders/index.php (Admin updates order/payment status or tracking)
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth_helper.php';

$pdo = get_db_connection();
$method = $_SERVER['REQUEST_METHOD'];

// Helper to format order row with items
function format_order_row(PDO $pdo, array $row): array {
    $itemsStmt = $pdo->prepare("SELECT product_id, name, price, quantity, size, color, image FROM order_items WHERE order_id = ?");
    $itemsStmt->execute([$row['id']]);
    $items = $itemsStmt->fetchAll();

    $formattedItems = array_map(function($i) {
        return [
            'id'       => $i['product_id'],
            'name'     => $i['name'],
            'price'    => (float)$i['price'],
            'quantity' => (int)$i['quantity'],
            'size'     => $i['size'],
            'color'    => $i['color'],
            'image'    => $i['image'],
        ];
    }, $items);

    return [
        'id'                   => $row['id'],
        'orderId'              => $row['order_id'],
        'customerId'           => $row['customer_id'],
        'customerName'         => $row['customer_name'],
        'customerEmail'        => $row['customer_email'],
        'customerPhone'        => $row['customer_phone'] ?: '',
        'totalAmount'          => (float)$row['total_amount'],
        'total'                => (float)$row['total_amount'],
        'subtotal'             => (float)$row['subtotal'],
        'shipping'             => (float)$row['shipping'],
        'discount'             => (float)$row['discount'],
        'tax'                  => (float)$row['tax'],
        'currency'             => $row['currency'],
        'paymentMethod'        => $row['payment_method'],
        'paymentStatus'        => $row['payment_status'],
        'orderStatus'          => $row['order_status'],
        'status'               => $row['order_status'],
        'transactionReference' => $row['transaction_reference'],
        'zelleReference'       => $row['zelle_reference'] ?: $row['transaction_reference'],
        'trackingNumber'       => $row['tracking_number'] ?: '',
        'carrier'              => $row['carrier'] ?: '',
        'estimatedDelivery'    => $row['estimated_delivery'] ?: '',
        'shippingAddress'      => json_decode($row['shipping_address'] ?: '{}', true),
        'items'                => $formattedItems,
        'createdAt'            => $row['created_at'],
        'date'                 => date('M d, Y', strtotime($row['created_at'])),
        'updatedAt'            => $row['updated_at'],
    ];
}

// ----------------------------------------------------------------------------
// GET: Fetch orders
// ----------------------------------------------------------------------------
if ($method === 'GET') {
    $currentUser = get_authenticated_user($pdo);
    $isAdmin = $currentUser && (($currentUser['role'] === 'admin') || is_admin_email($currentUser['email']));

    $id = $_GET['id'] ?? null;

    if ($id) {
        $stmt = $pdo->prepare("SELECT * FROM orders WHERE id = ? OR order_id = ? LIMIT 1");
        $stmt->execute([$id, $id]);
        $row = $stmt->fetch();
        if (!$row) {
            send_json_response(['success' => false, 'error' => 'Order not found'], 404);
        }

        // Security check: non-admin can only see their own order
        if (!$isAdmin && (!$currentUser || $currentUser['id'] !== $row['customer_id'])) {
            send_json_response(['success' => false, 'error' => 'Access denied to this order'], 403);
        }

        send_json_response(['success' => true, 'order' => format_order_row($pdo, $row)]);
    }

    // List orders
    if ($isAdmin) {
        // Admin views all orders
        $stmt = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC");
        $rows = $stmt->fetchAll();
    } else if ($currentUser) {
        // Logged-in customer views their own orders
        $stmt = $pdo->prepare("SELECT * FROM orders WHERE customer_id = ? OR customer_email = ? ORDER BY created_at DESC");
        $stmt->execute([$currentUser['id'], $currentUser['email']]);
        $rows = $stmt->fetchAll();
    } else {
        send_json_response(['success' => true, 'orders' => []]);
    }

    $orders = array_map(function($r) use ($pdo) {
        return format_order_row($pdo, $r);
    }, $rows);

    send_json_response(['success' => true, 'orders' => $orders]);
}

// ----------------------------------------------------------------------------
// POST: Create new order (Zelle payment submission)
// ----------------------------------------------------------------------------
if ($method === 'POST') {
    $input = get_json_input();

    // Mandatory transaction reference check
    $transRef = trim($input['transactionReference'] ?? $input['zelleReference'] ?? $input['paymentId'] ?? '');
    if (empty($transRef)) {
        send_json_response([
            'success' => false,
            'error'   => 'A Zelle transaction reference number is required to confirm your order.',
            'code'    => 'MISSING_TRANSACTION_REFERENCE'
        ], 400);
    }

    $customerName = trim($input['customerName'] ?? '');
    $customerEmail = strtolower(trim($input['customerEmail'] ?? ''));
    $customerPhone = trim($input['customerPhone'] ?? '');
    $items = is_array($input['items'] ?? null) ? $input['items'] : [];

    if (empty($customerEmail) || empty($items)) {
        send_json_response([
            'success' => false,
            'error'   => 'Customer email and order items are required.',
            'code'    => 'INVALID_ORDER_DATA'
        ], 400);
    }

    $currentUser = get_authenticated_user($pdo);
    $customerId = $currentUser ? $currentUser['id'] : trim($input['customerId'] ?? ('guest-' . time()));

    // Generate readable Order ID: MC-XXXXXX
    $orderNumber = strtoupper(substr(uniqid(), -6));
    $orderId = trim($input['orderId'] ?? "MC-$orderNumber");
    $id = $orderId;

    $totalAmount = (float)($input['totalAmount'] ?? $input['total'] ?? 0);
    $subtotal = (float)($input['subtotal'] ?? $totalAmount);
    $shipping = (float)($input['shipping'] ?? 0);
    $discount = (float)($input['discount'] ?? 0);
    $tax = (float)($input['tax'] ?? 0);
    $currency = trim($input['currency'] ?? 'USD');
    $shippingAddressJson = json_encode($input['shippingAddress'] ?? []);

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("
            INSERT INTO orders (
                id, order_id, customer_id, customer_name, customer_email, customer_phone,
                total_amount, subtotal, shipping, discount, tax, currency,
                payment_method, payment_status, order_status,
                transaction_reference, zelle_reference, shipping_address, created_at
            ) VALUES (
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?,
                'Zelle', 'Pending', 'Pending',
                ?, ?, ?, NOW()
            )
        ");
        $stmt->execute([
            $id, $orderId, $customerId, $customerName, $customerEmail, $customerPhone,
            $totalAmount, $subtotal, $shipping, $discount, $tax, $currency,
            $transRef, $transRef, $shippingAddressJson
        ]);

        // Insert items
        $itemStmt = $pdo->prepare("
            INSERT INTO order_items (order_id, product_id, name, price, quantity, size, color, image, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ");

        foreach ($items as $item) {
            $prodId = $item['product']['id'] ?? $item['productId'] ?? $item['id'] ?? 'item';
            $prodName = $item['product']['name'] ?? $item['name'] ?? 'Modest Item';
            $prodPrice = (float)($item['product']['price'] ?? $item['price'] ?? 0);
            $qty = (int)($item['quantity'] ?? 1);
            $size = $item['selectedSize'] ?? $item['size'] ?? 'Standard';
            $color = $item['selectedColor'] ?? $item['color'] ?? 'Original';
            $image = $item['product']['images'][0] ?? $item['image'] ?? '';

            $itemStmt->execute([$id, $prodId, $prodName, $prodPrice, $qty, $size, $color, $image]);
        }

        $pdo->commit();

        // Clear server-side cart for logged-in user upon successful order placement
        if ($currentUser) {
            $clearCart = $pdo->prepare("DELETE FROM cart_items WHERE user_id = ?");
            $clearCart->execute([$currentUser['id']]);
        }

        // Return full order object
        $fetchStmt = $pdo->prepare("SELECT * FROM orders WHERE id = ?");
        $fetchStmt->execute([$id]);
        $createdRow = $fetchStmt->fetch();

        send_json_response([
            'success' => true,
            'message' => 'Order placed successfully! Pending payment verification.',
            'orderId' => $orderId,
            'order'   => format_order_row($pdo, $createdRow),
        ], 201);

    } catch (Exception $e) {
        $pdo->rollBack();
        send_json_response([
            'success' => false,
            'error'   => 'Failed to save order: ' . $e->getMessage()
        ], 500);
    }
}

// ----------------------------------------------------------------------------
// PUT: Update order or payment status (Admin Only)
// ----------------------------------------------------------------------------
if ($method === 'PUT') {
    require_admin_user($pdo);

    $input = get_json_input();
    $id = trim($input['id'] ?? $input['orderId'] ?? ($_GET['id'] ?? ''));

    if (empty($id)) {
        send_json_response(['success' => false, 'error' => 'Order ID required for status update'], 400);
    }

    $fields = [];
    $params = [];

    if (isset($input['orderStatus'])) {
        $fields[] = "order_status = ?";
        $params[] = $input['orderStatus'];
    } elseif (isset($input['status'])) {
        $fields[] = "order_status = ?";
        $params[] = $input['status'];
    }

    if (isset($input['paymentStatus'])) {
        $fields[] = "payment_status = ?";
        $params[] = $input['paymentStatus'];
    }

    if (isset($input['trackingNumber'])) {
        $fields[] = "tracking_number = ?";
        $params[] = $input['trackingNumber'];
    }

    if (isset($input['carrier'])) {
        $fields[] = "carrier = ?";
        $params[] = $input['carrier'];
    }

    if (isset($input['estimatedDelivery'])) {
        $fields[] = "estimated_delivery = ?";
        $params[] = $input['estimatedDelivery'];
    }

    if (empty($fields)) {
        send_json_response(['success' => false, 'error' => 'No update parameters provided'], 400);
    }

    $params[] = $id;
    $params[] = $id;

    $sql = "UPDATE orders SET " . implode(", ", $fields) . " WHERE id = ? OR order_id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    $stmt = $pdo->prepare("SELECT * FROM orders WHERE id = ? OR order_id = ?");
    $stmt->execute([$id, $id]);
    $updatedRow = $stmt->fetch();

    send_json_response([
        'success' => true,
        'message' => 'Order updated successfully',
        'order'   => format_order_row($pdo, $updatedRow)
    ]);
}

send_json_response(['success' => false, 'error' => 'Method not allowed'], 405);
