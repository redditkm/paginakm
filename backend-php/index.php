<?php

/**
 * index.php - PUNTO DE ENTRADA PRINCIPAL DEL API
 * VERSIÓN MÍNIMA - Solo lo esencial funciona
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// =====================
// CARGAR SOLO LO NECESARIO
// =====================

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/app/Http/Controllers/AuthController.php';
require_once __DIR__ . '/app/Http/Controllers/ContentController.php';
require_once __DIR__ . '/app/Http/Middleware/AuthMiddleware.php';
require_once __DIR__ . '/app/Helpers/ResponseHelper.php';

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContentController;
use App\Http\Middleware\AuthMiddleware;

// =====================
// INICIALIZAR
// =====================

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Limpiar path
$path = str_replace('/backend-php', '', $path);
$path = str_replace('/index.php', '', $path);

$response = new \App\Helpers\ResponseHelper();
$authController = new AuthController($pdo);
$contentController = new ContentController($pdo);

// ========================
// RUTAS PÚBLICAS - CONTENIDO
// ========================

// GET /api/contents/{slug}
if ($method === 'GET' && preg_match('/^\/api\/contents\/([a-z0-9\-]+)$/', $path, $matches)) {
    $contentController->getBySlug($matches[1]);
    exit;
}

// GET /api/contents
if ($method === 'GET' && $path === '/api/contents') {
    $contentController->getAll();
    exit;
}

// GET /api/contents/search
if ($method === 'GET' && strpos($path, '/api/contents/search') === 0) {
    $contentController->search();
    exit;
}

// ========================
// RUTAS PÚBLICAS - MOCK
// ========================

// GET /api/blogs
if ($method === 'GET' && $path === '/api/blogs') {
    http_response_code(200);
    echo json_encode(['data' => []]);
    exit;
}

// GET /api/leads/count
if ($method === 'GET' && $path === '/api/leads/count') {
    http_response_code(200);
    echo json_encode(['data' => ['count' => 0, 'unread' => 0]]);
    exit;
}

// GET /api/festividades
if ($method === 'GET' && $path === '/api/festividades') {
    http_response_code(200);
    echo json_encode([
        'data' => [
            'navidad' => false,
            'halloween' => false,
            'sanValentin' => false,
            'fourthJuly' => false
        ]
    ]);
    exit;
}

// POST /api/festividades
if ($method === 'POST' && $path === '/api/festividades') {
    http_response_code(200);
    echo json_encode(['message' => 'OK']);
    exit;
}

// POST /api/leads
if ($method === 'POST' && $path === '/api/leads') {
    http_response_code(200);
    echo json_encode(['message' => 'Lead creado']);
    exit;
}

// ========================
// RUTAS DE AUTENTICACIÓN
// ========================

// POST /api/login
if ($method === 'POST' && $path === '/api/login') {
    $authController->login();
    exit;
}

// POST /api/register
if ($method === 'POST' && $path === '/api/register') {
    $authController->register();
    exit;
}

// ========================
// RUTAS PROTEGIDAS
// ========================

// GET /api/me
if ($method === 'GET' && $path === '/api/me') {
    AuthMiddleware::require();
    $authController->getCurrentUser();
    exit;
}

// POST /api/change-password
if ($method === 'POST' && $path === '/api/change-password') {
    AuthMiddleware::require();
    $authController->changePassword();
    exit;
}

// ========================
// RUTAS ADMIN - CONTENIDO
// ========================

// GET /api/admin/contents
if ($method === 'GET' && $path === '/api/admin/contents') {
    AuthMiddleware::require();
    $contentController->adminGetAll();
    exit;
}

// GET /api/admin/contents/{id}
if ($method === 'GET' && preg_match('/^\/api\/admin\/contents\/([0-9]+)$/', $path, $matches)) {
    AuthMiddleware::require();
    $contentController->getById($matches[1]);
    exit;
}

// POST /api/admin/contents
if ($method === 'POST' && $path === '/api/admin/contents') {
    AuthMiddleware::require();
    $contentController->store();
    exit;
}

// PUT /api/admin/contents/{id}
if ($method === 'PUT' && preg_match('/^\/api\/admin\/contents\/([0-9]+)$/', $path, $matches)) {
    AuthMiddleware::require();
    $contentController->update($matches[1]);
    exit;
}

// DELETE /api/admin/contents/{id}
if ($method === 'DELETE' && preg_match('/^\/api\/admin\/contents\/([0-9]+)$/', $path, $matches)) {
    AuthMiddleware::require();
    $contentController->delete($matches[1]);
    exit;
}

// PATCH /api/admin/contents/{id}/publish
if ($method === 'PATCH' && preg_match('/^\/api\/admin\/contents\/([0-9]+)\/publish$/', $path, $matches)) {
    AuthMiddleware::require();
    $contentController->togglePublish($matches[1]);
    exit;
}

// GET /api/admin/contents/type/{type}
if ($method === 'GET' && preg_match('/^\/api\/admin\/contents\/type\/([a-z\-]+)$/', $path, $matches)) {
    AuthMiddleware::require();
    $contentController->getByType($matches[1]);
    exit;
}

// GET /api/admin/contents/stats
if ($method === 'GET' && $path === '/api/admin/contents/stats') {
    AuthMiddleware::require();
    $contentController->getStats();
    exit;
}

// ========================
// RUTA RAÍZ
// ========================

if ($method === 'GET' && $path === '/') {
    http_response_code(200);
    echo json_encode([
        'api' => 'KM DINIVAL API',
        'status' => '✅ online'
    ]);
    exit;
}

// ========================
// ERROR 404
// ========================

http_response_code(404);
echo json_encode([
    'error' => 'Ruta no encontrada',
    'path' => $path,
    'method' => $method
]);
exit;

?>