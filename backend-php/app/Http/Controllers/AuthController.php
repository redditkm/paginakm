<?php

namespace App\Http\Controllers;

use App\Helpers\ResponseHelper;
use App\Http\Middleware\AuthMiddleware;
use PDO;
use PDOException;

class AuthController
{
    private $pdo;
    private $response;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
        $this->response = new ResponseHelper();
    }

    /**
     * POST /api/login
     * Login con usuario y contraseña (Argon2)
     */
    public function login()
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            $username = trim($data['username'] ?? '');
            $password = trim($data['password'] ?? '');

            // Validación básica
            if (empty($username) || empty($password)) {
                return $this->response->error(400, 'Usuario y contraseña requeridos');
            }

            // Buscar usuario
            $stmt = $this->pdo->prepare(
                "SELECT id, username, email, password, is_admin, is_active FROM users WHERE username = ? OR email = ?"
            );
            $stmt->execute([$username, $username]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            // Validar usuario existe
            if (!$user) {
                // Por seguridad, no especificar si el usuario no existe
                return $this->response->error(401, 'Credenciales inválidas');
            }

            // Validar que sea admin
            if (!$user['is_admin']) {
                return $this->response->error(401, 'Acceso denegado. No tienes permisos de administrador.');
            }

            // Validar que esté activo
            if (!$user['is_active']) {
                return $this->response->error(401, 'Tu cuenta está desactivada');
            }

            // Verificar contraseña con Argon2
            if (!password_verify($password, $user['password'])) {
                return $this->response->error(401, 'Credenciales inválidas');
            }

            // Generar JWT
            $token = AuthMiddleware::generateToken(
                $user['id'],
                $user['username'],
                $user['is_admin']
            );

            // Actualizar last_login
            $this->pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?")
                ->execute([$user['id']]);

            return $this->response->success(
                [
                    'token' => $token,
                    'user' => [
                        'id' => $user['id'],
                        'username' => $user['username'],
                        'email' => $user['email']
                    ]
                ],
                'Login exitoso'
            );

        } catch (\Exception $e) {
            error_log("Error en login: " . $e->getMessage());
            return $this->response->error(500, 'Error procesando solicitud');
        }
    }

    /**
     * POST /api/register (opcional, para crear usuarios adicionales)
     */
    public function register()
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            $username = trim($data['username'] ?? '');
            $email = trim($data['email'] ?? '');
            $password = trim($data['password'] ?? '');
            $password_confirm = trim($data['password_confirm'] ?? '');

            // Validaciones
            if (empty($username) || strlen($username) < 3) {
                return $this->response->error(400, 'Usuario debe tener al menos 3 caracteres');
            }

            if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                return $this->response->error(400, 'Email inválido');
            }

            if (empty($password) || strlen($password) < 8) {
                return $this->response->error(400, 'Contraseña debe tener al menos 8 caracteres');
            }

            if ($password !== $password_confirm) {
                return $this->response->error(400, 'Las contraseñas no coinciden');
            }

            // Verificar que no exista usuario
            $stmt = $this->pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
            $stmt->execute([$username, $email]);
            
            if ($stmt->fetch()) {
                return $this->response->error(400, 'El usuario o email ya existe');
            }

            // Hash con Argon2
            $hashed_password = password_hash($password, PASSWORD_ARGON2ID, [
                'memory_cost' => 2048,
                'time_cost' => 4,
                'threads' => 3
            ]);

            // Crear usuario
            $stmt = $this->pdo->prepare(
                "INSERT INTO users (username, email, password, is_admin, is_active) 
                 VALUES (?, ?, ?, 0, 1)"
            );
            $stmt->execute([$username, $email, $hashed_password]);

            $userId = $this->pdo->lastInsertId();

            return $this->response->success(
                [
                    'id' => $userId,
                    'username' => $username,
                    'email' => $email
                ],
                'Usuario registrado exitosamente',
                201
            );

        } catch (\Exception $e) {
            error_log("Error en register: " . $e->getMessage());
            return $this->response->error(500, 'Error procesando solicitud');
        }
    }

    /**
     * POST /api/change-password
     * Cambiar contraseña (requiere autenticación)
     */
    public function changePassword()
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            $current_password = trim($data['current_password'] ?? '');
            $new_password = trim($data['new_password'] ?? '');
            $new_password_confirm = trim($data['new_password_confirm'] ?? '');

            // Validaciones
            if (empty($current_password) || empty($new_password)) {
                return $this->response->error(400, 'Todos los campos son requeridos');
            }

            if (strlen($new_password) < 8) {
                return $this->response->error(400, 'Nueva contraseña debe tener al menos 8 caracteres');
            }

            if ($new_password !== $new_password_confirm) {
                return $this->response->error(400, 'Las contraseñas no coinciden');
            }

            // Obtener usuario actual (desde middleware)
            $user_id = $_SESSION['user_id'] ?? null;
            
            if (!$user_id) {
                return $this->response->error(401, 'No autenticado');
            }

            // Buscar usuario
            $stmt = $this->pdo->prepare("SELECT id, password FROM users WHERE id = ?");
            $stmt->execute([$user_id]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                return $this->response->error(404, 'Usuario no encontrado');
            }

            // Verificar contraseña actual
            if (!password_verify($current_password, $user['password'])) {
                return $this->response->error(401, 'Contraseña actual incorrecta');
            }

            // Hash nueva contraseña
            $hashed_password = password_hash($new_password, PASSWORD_ARGON2ID, [
                'memory_cost' => 2048,
                'time_cost' => 4,
                'threads' => 3
            ]);

            // Actualizar
            $this->pdo->prepare("UPDATE users SET password = ? WHERE id = ?")
                ->execute([$hashed_password, $user_id]);

            return $this->response->success(
                [],
                'Contraseña actualizada exitosamente'
            );

        } catch (\Exception $e) {
            error_log("Error en changePassword: " . $e->getMessage());
            return $this->response->error(500, 'Error procesando solicitud');
        }
    }

    /**
     * GET /api/me
     * Obtener datos del usuario actual (requiere autenticación)
     */
    public function getCurrentUser()
    {
        try {
            $user_id = $_SESSION['user_id'] ?? null;

            if (!$user_id) {
                return $this->response->error(401, 'No autenticado');
            }

            $stmt = $this->pdo->prepare(
                "SELECT id, username, email, is_admin, is_active, created_at, last_login FROM users WHERE id = ?"
            );
            $stmt->execute([$user_id]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                return $this->response->error(404, 'Usuario no encontrado');
            }

            return $this->response->success($user, 'Usuario obtenido');

        } catch (\Exception $e) {
            error_log("Error en getCurrentUser: " . $e->getMessage());
            return $this->response->error(500, 'Error procesando solicitud');
        }
    }
}
?>