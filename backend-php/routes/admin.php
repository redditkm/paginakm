<?php

// routes/admin.php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../app/Http/Controllers/ContentController.php';
require_once __DIR__ . '/../app/Http/Controllers/BlogController.php';
require_once __DIR__ . '/../app/Http/Controllers/LeadsController.php';
require_once __DIR__ . '/../app/Http/Controllers/UserController.php';
require_once __DIR__ . '/../app/Http/Middleware/AuthMiddleware.php';
require_once __DIR__ . '/../app/Helpers/ResponseHelper.php';

use App\Http\Controllers\ContentController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\LeadsController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\AuthMiddleware;

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace('/api/admin', '', $path);

$response = new \App\Helpers\ResponseHelper();

// Validar autenticación
if (!AuthMiddleware::check()) {
    return $response->unauthorized('Token no válido o expirado');
}

$contentController = new ContentController($pdo);
$blogController = new BlogController($pdo);
$leadsController = new LeadsController($pdo);
$userController = new UserController($pdo);

// ========================
// RUTAS ADMIN - CONTENIDO
// ========================

if ($method === 'GET' && $path === '/contents') {
    $contentController->adminGetAll();
}

if ($method === 'GET' && preg_match('/^\/contents\/([0-9]+)$/', $path, $matches)) {
    $contentController->getById($matches[1]);
}

if ($method === 'POST' && $path === '/contents') {
    $contentController->store();
}

if ($method === 'PUT' && preg_match('/^\/contents\/([0-9]+)$/', $path, $matches)) {
    $contentController->update($matches[1]);
}

if ($method === 'DELETE' && preg_match('/^\/contents\/([0-9]+)$/', $path, $matches)) {
    $contentController->delete($matches[1]);
}

if ($method === 'PATCH' && preg_match('/^\/contents\/([0-9]+)\/publish$/', $path, $matches)) {
    $contentController->togglePublish($matches[1]);
}

if ($method === 'GET' && preg_match('/^\/contents\/type\/([a-z]+)$/', $path, $matches)) {
    $contentController->getByType($matches[1]);
}

if ($method === 'GET' && $path === '/contents/stats') {
    $contentController->getStats();
}

// ========================
// RUTAS ADMIN - BLOGS
// ========================

if ($method === 'GET' && $path === '/blogs') {
    $blogController->getAll();
}

if ($method === 'GET' && preg_match('/^\/blogs\/([0-9]+)$/', $path, $matches)) {
    $blogController->getById($matches[1]);
}

if ($method === 'POST' && $path === '/blogs') {
    $blogController->create();
}

if ($method === 'PUT' && preg_match('/^\/blogs\/([0-9]+)$/', $path, $matches)) {
    $blogController->update($matches[1]);
}

if ($method === 'DELETE' && preg_match('/^\/blogs\/([0-9]+)$/', $path, $matches)) {
    $blogController->delete($matches[1]);
}

// ========================
// RUTAS ADMIN - LEADS
// ========================

if ($method === 'GET' && $path === '/leads') {
    $leadsController->getAll();
}

if ($method === 'GET' && preg_match('/^\/leads\/([0-9]+)$/', $path, $matches)) {
    $leadsController->getById($matches[1]);
}

if ($method === 'DELETE' && preg_match('/^\/leads\/([0-9]+)$/', $path, $matches)) {
    $leadsController->delete($matches[1]);
}

if ($method === 'PATCH' && preg_match('/^\/leads\/([0-9]+)\/read$/', $path, $matches)) {
    $leadsController->toggleRead($matches[1]);
}

// ========================
// RUTAS ADMIN - USUARIOS
// ========================

if ($method === 'GET' && $path === '/users') {
    $userController->getAll();
}

if ($method === 'GET' && preg_match('/^\/users\/([0-9]+)$/', $path, $matches)) {
    $userController->getById($matches[1]);
}

if ($method === 'POST' && $path === '/users') {
    $userController->create();
}

if ($method === 'PUT' && preg_match('/^\/users\/([0-9]+)$/', $path, $matches)) {
    $userController->update($matches[1]);
}

if ($method === 'DELETE' && preg_match('/^\/users\/([0-9]+)$/', $path, $matches)) {
    $userController->delete($matches[1]);
}

// ========================
// RUTAS POR DEFECTO
// ========================

http_response_code(404);
echo json_encode(['error' => 'Ruta de admin no encontrada']);
exit;
?>