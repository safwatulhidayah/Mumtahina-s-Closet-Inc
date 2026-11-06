<?php
/**
 * Mumtahina’s Closet Inc - Secure Image Upload API
 * Endpoint: POST /api/upload/index.php
 *
 * Handles single and multiple file uploads for products, categories, and general media.
 * Enforces strict MIME inspection, extension whitelisting, and size limits.
 */

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json_response(['success' => false, 'error' => 'Method not allowed'], 405);
}

$pdo = get_db_connection();
require_admin_user($pdo); // Only authorized administrators can upload media

// Target folder: products, categories, or general
$targetType = preg_replace('/[^a-z0-9_-]/i', '', $_POST['type'] ?? 'products');
if (!in_array($targetType, ['products', 'categories', 'general'])) {
    $targetType = 'products';
}

$root = realpath(__DIR__ . '/../../') ?: dirname(dirname(__DIR__));
$baseUploadDir = rtrim($root, '/') . '/uploads/' . $targetType . '/';
if (!is_dir($baseUploadDir)) {
    mkdir($baseUploadDir, 0755, true);
}

// Allowed MIME types and extensions
$allowedMimeTypes = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
    'image/gif'  => 'gif',
];

$maxFileSize = 10 * 1024 * 1024; // 10 Megabytes

// Normalize incoming files into a flat list
$filesToProcess = [];

if (isset($_FILES['files']) && is_array($_FILES['files']['name'])) {
    $count = count($_FILES['files']['name']);
    for ($i = 0; $i < $count; $i++) {
        if ($_FILES['files']['error'][$i] === UPLOAD_ERR_OK) {
            $filesToProcess[] = [
                'name'     => $_FILES['files']['name'][$i],
                'type'     => $_FILES['files']['type'][$i],
                'tmp_name' => $_FILES['files']['tmp_name'][$i],
                'error'    => $_FILES['files']['error'][$i],
                'size'     => $_FILES['files']['size'][$i],
            ];
        }
    }
} elseif (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
    $filesToProcess[] = $_FILES['file'];
} elseif (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $filesToProcess[] = $_FILES['image'];
}

if (empty($filesToProcess)) {
    send_json_response(['success' => false, 'error' => 'No valid image files received for upload'], 400);
}

$uploadedUrls = [];
$errors = [];

// Determine base URL of this server
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || ($_SERVER['SERVER_PORT'] ?? 0) == 443
    || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https')
    ? 'https://' : 'http://';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$baseUrl = $protocol . $host;

// Finfo for true server-side MIME type inspection
$finfo = finfo_open(FILEINFO_MIME_TYPE);

foreach ($filesToProcess as $file) {
    $tmpName = $file['tmp_name'];
    $originalName = $file['name'];
    $size = $file['size'];

    // 1. Check size limit
    if ($size > $maxFileSize) {
        $errors[] = "$originalName exceeds the maximum size of 10MB.";
        continue;
    }

    // 2. Validate MIME type
    $mime = finfo_file($finfo, $tmpName);
    if (!isset($allowedMimeTypes[$mime])) {
        $errors[] = "$originalName has an unsupported file format ($mime). Only JPG, PNG, WEBP, and GIF are allowed.";
        continue;
    }

    // 3. Prevent dangerous extensions
    $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    $dangerousExtensions = ['php', 'phtml', 'php3', 'php4', 'php5', 'phps', 'cgi', 'pl', 'sh', 'py', 'exe', 'asp', 'aspx', 'js', 'html', 'htm'];
    if (in_array($ext, $dangerousExtensions)) {
        $errors[] = "$originalName contains a prohibited extension.";
        continue;
    }

    // Standardize extension
    $safeExt = $allowedMimeTypes[$mime];

    // 4. Generate cryptographically unique filename
    $uniqueName = 'img_' . date('Ymd_His') . '_' . bin2hex(random_bytes(8)) . '.' . $safeExt;
    $targetPath = $baseUploadDir . $uniqueName;

    // 5. Move uploaded file
    if (move_uploaded_file($tmpName, $targetPath)) {
        // Build relative web path and full public URL
        $relativePath = '/uploads/' . $targetType . '/' . $uniqueName;
        $fullUrl = $baseUrl . $relativePath;
        $uploadedUrls[] = $fullUrl;
    } else {
        $errors[] = "Failed to save $originalName to server storage.";
    }
}

finfo_close($finfo);

if (empty($uploadedUrls)) {
    send_json_response([
        'success' => false,
        'error'   => 'Upload failed: ' . implode(' ', $errors),
    ], 400);
}

send_json_response([
    'success'      => true,
    'message'      => count($uploadedUrls) . ' image(s) uploaded successfully',
    'urls'         => $uploadedUrls,
    'url'          => $uploadedUrls[0], // Single upload convenience
    'relativePath' => '/uploads/' . $targetType . '/' . basename($uploadedUrls[0]),
    'errors'       => $errors,
]);
