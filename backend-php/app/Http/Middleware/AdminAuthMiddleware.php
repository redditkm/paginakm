<?php

// app/Http/Middleware/AdminAuthMiddleware.php

namespace App\Http\Middleware;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AdminAuthMiddleware
{
    /**
     * Verificar autenticación de admin
     */
    public static function check()
    {
        $token = self::getToken();

        if (!$token) {
            return false;
        }

        return self::validateToken($token);
    }

    /**
     * Obtener token del header
     */
    private static function getToken()
    {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

        if (empty($authHeader)) {
            return null;
        }

        if (preg_match('/Bearer\s+(.+)/i', $authHeader, $matches)) {
            return $matches[1];
        }

        return null;
    }

    /**
     * Validar token JWT y verificar que sea admin
     */
    private static function validateToken($token)
    {
        try {
            $jwtSecret = $_ENV['JWT_SECRET'] ?? getenv('JWT_SECRET') ?? 'algoseguroparalosblogtokensecretos';
            
            $decoded = JWT::decode($token, new Key($jwtSecret, 'HS256'));
            
            // Verificar que sea admin
            if (!isset($decoded->is_admin) || $decoded->is_admin !== true) {
                return false;
            }

            $_SESSION['user_id'] = $decoded->id ?? null;
            $_SESSION['username'] = $decoded->username ?? null;
            $_SESSION['is_admin'] = true;
            
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Requerir autenticación de admin (detiene ejecución si no autorizado)
     */
    public static function require()
    {
        if (!self::check()) {
            header('Content-Type: application/json');
            http_response_code(401);
            echo json_encode(['error' => 'No autorizado. Token inválido o expirado.']);
            exit;
        }
    }

    /**
     * Verificar si es admin
     */
    public static function isAdmin()
    {
        return isset($_SESSION['is_admin']) && $_SESSION['is_admin'] === true;
    }

    /**
     * Obtener ID del admin actual
     */
    public static function getAdminId()
    {
        return $_SESSION['user_id'] ?? null;
    }

    /**
     * Obtener datos del admin actual
     */
    public static function getAdmin()
    {
        return [
            'id' => $_SESSION['user_id'] ?? null,
            'username' => $_SESSION['username'] ?? null,
            'is_admin' => $_SESSION['is_admin'] ?? false
        ];
    }
}
?>