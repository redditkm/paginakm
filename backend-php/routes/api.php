<?php

/**
 * routes/api.php - API COMPLETA
 * 
 * RUTAS PÚBLICAS:
 * - GET /api/contents - Obtener todos los contenidos publicados
 * - GET /api/contents/{slug} - Obtener contenido por slug
 * - GET /api/contents/search - Buscar contenidos
 * - GET /api/blogs - Obtener todos los blogs
 * - GET /api/blogs/{id} - Obtener blog por ID
 * - POST /api/leads - Crear lead
 * - GET /api/leads/count - Contador de leads
 * - GET /api/leads/stream - SSE de leads
 * - GET /api/zip/{code} - Obtener condados por ZIP
 * - GET /api/festividades - Estado festividades
 * 
 * RUTAS DE AUTENTICACIÓN:
 * - POST /api/login - Login (usuario + contraseña Argon2)
 * - POST /api/register - Registro de usuario
 * 
 * RUTAS ADMIN PROTEGIDAS:
 * - /api/admin/* - Requieren JWT válido
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// =====================
// CARGAR DEPENDENCIAS
// =====================

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../app/Http/Controllers/AuthController.php';
require_once __DIR__ . '/../app/Http/Controllers/BlogController.php';
require_once __DIR__ . '/../app/Http/Controllers/LeadsController.php';
require_once __DIR__ . '/../app/Http/Controllers/ContentController.php';
require_once __DIR__ . '/../app/Http/Controllers/UserController.php';
require_once __DIR__ . '/../app/Http/Controllers/ZipController.php';
require_once __DIR__ . '/../app/Http/Controllers/FestividadesController.php';
require_once __DIR__ . '/../app/Http/Middleware/AuthMiddleware.php';
require_once __DIR__ . '/../app/Helpers/ResponseHelper.php';

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\LeadsController;
use App\Http\Controllers\ContentController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ZipController;
use App\Http\Controllers\FestividadesController;
use App\Http\Middleware\AuthMiddleware;

// =====================
// INICIALIZAR
// =====================

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace('/api', '', $path);

$response = new \App\Helpers\ResponseHelper();

// Instanciar controllers
$authController = new AuthController($pdo);
$blogController = new BlogController($pdo);
$leadsController = new LeadsController($pdo);
$contentController = new ContentController($pdo);
$userController = new UserController($pdo);
$zipController = new ZipController();
$festividadesController = new FestividadesController();

// ========================
// RUTAS PÚBLICAS - CONTENIDO
// ========================

// GET /api/contents/{slug} - Obtener por slug
if ($method === 'GET' && preg_match('/^\/contents\/([a-z0-9\-]+)$/', $path, $matches)) {
    $contentController->getBySlug($matches[1]);
    exit;
}

// GET /api/contents - Obtener todos (solo publicados)
if ($method === 'GET' && $path === '/contents') {
    $contentController->getAll();
    exit;
}

// GET /api/contents/search - Buscar
if ($method === 'GET' && preg_match('/^\/contents\/search/', $path)) {
    $contentController->search();
    exit;
}

// ========================
// RUTAS PÚBLICAS - BLOGS
// ========================

// GET /api/blogs - Obtener todos
if ($method === 'GET' && $path === '/blogs') {
    $blogController->getAll();
    exit;
}

// GET /api/blogs/{id} - Obtener por ID
if ($method === 'GET' && preg_match('/^\/blogs\/([0-9]+)$/', $path, $matches)) {
    $blogController->getById($matches[1]);
    exit;
}

// ========================
// RUTAS PÚBLICAS - LEADS
// ========================

// POST /api/leads - Crear lead
if ($method === 'POST' && $path === '/leads') {
    $leadsController->create();
    exit;
}

// GET /api/leads/stream - SSE
if ($method === 'GET' && $path === '/leads/stream') {
    $leadsController->stream();
    exit;
}

// GET /api/leads/count - Contador
if ($method === 'GET' && $path === '/leads/count') {
    $leadsController->count();
    exit;
}

// ========================
// RUTAS PÚBLICAS - ZIP
// ========================

// GET /api/zip/{code} - Obtener condados
if ($method === 'GET' && preg_match('/^\/zip\/([0-9]+)$/', $path, $matches)) {
    $zipController->getCounties($matches[1]);
    exit;
}

// ========================
// RUTAS PÚBLICAS - FESTIVIDADES
// ========================

// GET /api/festividades - Obtener estado
if ($method === 'GET' && $path === '/festividades') {
    $festividadesController->getAll();
    exit;
}

// POST /api/festividades - Actualizar (sin protección por ahora)
if ($method === 'POST' && $path === '/festividades') {
    $festividadesController->update();
    exit;
}

// ========================
// RUTAS DE AUTENTICACIÓN
// ========================

// POST /api/login - Login (usuario + contraseña)
if ($method === 'POST' && $path === '/login') {
    $authController->login();
    exit;
}

// POST /api/register - Registrar usuario
if ($method === 'POST' && $path === '/register') {
    $authController->register();
    exit;
}

// ========================
// RUTAS PROTEGIDAS - USUARIO
// ========================

// GET /api/me - Obtener usuario actual
if ($method === 'GET' && $path === '/me') {
    AuthMiddleware::require();
    $authController->getCurrentUser();
    exit;
}

// POST /api/change-password - Cambiar contraseña
if ($method === 'POST' && $path === '/change-password') {
    AuthMiddleware::require();
    $authController->changePassword();
    exit;
}

// ========================
// RUTAS ADMIN - CONTENIDO (PROTEGIDAS)
// ========================

// GET /api/admin/contents - Obtener todos (con filtros)
if ($method === 'GET' && $path === '/admin/contents') {
    AuthMiddleware::require();
    $contentController->adminGetAll();
    exit;
}

// GET /api/admin/contents/{id} - Obtener por ID
if ($method === 'GET' && preg_match('/^\/admin\/contents\/([0-9]+)$/', $path, $matches)) {
    AuthMiddleware::require();
    $contentController->getById($matches[1]);
    exit;
}

// POST /api/admin/contents - Crear contenido
if ($method === 'POST' && $path === '/admin/contents') {
    AuthMiddleware::require();
    $contentController->store();
    exit;
}

// PUT /api/admin/contents/{id} - Actualizar contenido
if ($method === 'PUT' && preg_match('/^\/admin\/contents\/([0-9]+)$/', $path, $matches)) {
    AuthMiddleware::require();
    $contentController->update($matches[1]);
    exit;
}

// DELETE /api/admin/contents/{id} - Eliminar contenido
if ($method === 'DELETE' && preg_match('/^\/admin\/contents\/([0-9]+)$/', $path, $matches)) {
    AuthMiddleware::require();
    $contentController->delete($matches[1]);
    exit;
}

// PATCH /api/admin/contents/{id}/publish - Publicar/Despublicar
if ($method === 'PATCH' && preg_match('/^\/admin\/contents\/([0-9]+)\/publish$/', $path, $matches)) {
    AuthMiddleware::require();
    $contentController->togglePublish($matches[1]);
    exit;
}

// GET /api/admin/contents/type/{type} - Obtener por tipo
if ($method === 'GET' && preg_match('/^\/admin\/contents\/type\/([a-z\-]+)$/', $path, $matches)) {
    AuthMiddleware::require();
    $contentController->getByType($matches[1]);
    exit;
}

// GET /api/admin/contents/stats - Estadísticas
if ($method === 'GET' && $path === '/admin/contents/stats') {
    AuthMiddleware::require();
    $contentController->getStats();
    exit;
}

// ========================
// RUTAS ADMIN - BLOGS (PROTEGIDAS)
// ========================

// POST /api/admin/blogs - Crear blog
if ($method === 'POST' && $path === '/admin/blogs') {
    AuthMiddleware::require();
    $blogController->create();
    exit;
}

// GET /api/admin/blogs - Obtener blogs (admin)
if ($method === 'GET' && $path === '/admin/blogs') {
    AuthMiddleware::require();
    $blogController->getAll();
    exit;
}

// GET /api/admin/blogs/{id} - Obtener blog por ID (admin)
if ($method === 'GET' && preg_match('/^\/admin\/blogs\/([0-9]+)$/', $path, $matches)) {
    AuthMiddleware::require();
    $blogController->getById($matches[1]);
    exit;
}

// PUT /api/admin/blogs/{id} - Actualizar blog
if ($method === 'PUT' && preg_match('/^\/admin\/blogs\/([0-9]+)$/', $path, $matches)) {
    AuthMiddleware::require();
    $blogController->update($matches[1]);
    exit;
}

// DELETE /api/admin/blogs/{id} - Eliminar blog
if ($method === 'DELETE' && preg_match('/^\/admin\/blogs\/([0-9]+)$/', $path, $matches)) {
    AuthMiddleware::require();
    $blogController->delete($matches[1]);
    exit;
}

// ========================
// RUTAS ADMIN - LEADS (PROTEGIDAS)
// ========================

// GET /api/admin/leads - Obtener leads
if ($method === 'GET' && $path === '/admin/leads') {
    AuthMiddleware::require();
    $leadsController->getAll();
    exit;
}

// GET /api/admin/leads/{id} - Obtener lead por ID
if ($method === 'GET' && preg_match('/^\/admin\/leads\/([0-9]+)$/', $path, $matches)) {
    AuthMiddleware::require();
    $leadsController->getById($matches[1]);
    exit;
}

// DELETE /api/admin/leads/{id} - Eliminar lead
if ($method === 'DELETE' && preg_match('/^\/admin\/leads\/([0-9]+)$/', $path, $matches)) {
    AuthMiddleware::require();
    $leadsController->delete($matches[1]);
    exit;
}

// PATCH /api/admin/leads/{id}/read - Marcar como leído
if ($method === 'PATCH' && preg_match('/^\/admin\/leads\/([0-9]+)\/read$/', $path, $matches)) {
    AuthMiddleware::require();
    $leadsController->toggleRead($matches[1]);
    exit;
}

// ========================
// RUTAS ADMIN - USUARIOS (PROTEGIDAS)
// ========================

// GET /api/admin/users - Obtener usuarios
if ($method === 'GET' && $path === '/admin/users') {
    AuthMiddleware::require();
    $userController->getAll();
    exit;
}

// GET /api/admin/users/{id} - Obtener usuario por ID
if ($method === 'GET' && preg_match('/^\/admin\/users\/([0-9]+)$/', $path, $matches)) {
    AuthMiddleware::require();
    $userController->getById($matches[1]);
    exit;
}

// POST /api/admin/users - Crear usuario
if ($method === 'POST' && $path === '/admin/users') {
    AuthMiddleware::require();
    $userController->create();
    exit;
}

// PUT /api/admin/users/{id} - Actualizar usuario
if ($method === 'PUT' && preg_match('/^\/admin\/users\/([0-9]+)$/', $path, $matches)) {
    AuthMiddleware::require();
    $userController->update($matches[1]);
    exit;
}

// DELETE /api/admin/users/{id} - Eliminar usuario
if ($method === 'DELETE' && preg_match('/^\/admin\/users\/([0-9]+)$/', $path, $matches)) {
    AuthMiddleware::require();
    $userController->delete($matches[1]);
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