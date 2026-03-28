<?php

namespace App\Http\Middleware;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthMiddleware
{
    private static $jwtSecret;

    public function __construct()
    {
        self::$jwtSecret = $_ENV['JWT_SECRET'] ?? getenv('JWT_SECRET') ?? 'algoseguroparalosblogtokensecretos';
    }

    /**
     * Verificar autenticación
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
     * Validar token JWT
     */
    private static function validateToken($token)
    {
        try {
            $jwtSecret = $_ENV['JWT_SECRET'] ?? getenv('JWT_SECRET') ?? 'algoseguroparalosblogtokensecretos';
            
            $decoded = JWT::decode($token, new Key($jwtSecret, 'HS256'));
            
            $_SESSION['user_id'] = $decoded->id ?? null;
            $_SESSION['username'] = $decoded->username ?? null;
            $_SESSION['is_admin'] = $decoded->is_admin ?? false;
            
            return true;
        } catch (\Exception $e) {
            return false;
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
     * Obtener ID del usuario actual
     */
    public static function getUserId()
    {
        return $_SESSION['user_id'] ?? null;
    }

    /**
     * Obtener usuario actual
     */
    public static function getUser()
    {
        return [
            'id' => $_SESSION['user_id'] ?? null,
            'username' => $_SESSION['username'] ?? null,
            'is_admin' => $_SESSION['is_admin'] ?? false
        ];
    }

    /**
     * Requerir autenticación
     */
    public static function require()
    {
        if (!self::check()) {
            header('Content-Type: application/json');
            http_response_code(401);
            echo json_encode(['error' => 'No autorizado']);
            exit;
        }
    }

    /**
     * Requerir admin
     */
    public static function requireAdmin()
    {
        self::require();

        if (!self::isAdmin()) {
            header('Content-Type: application/json');
            http_response_code(403);
            echo json_encode(['error' => 'Acceso denegado']);
            exit;
        }
    }

    /**
     * Generar token JWT
     */
    public static function generateToken($userId, $username, $isAdmin = false)
    {
        $jwtSecret = $_ENV['JWT_SECRET'] ?? getenv('JWT_SECRET') ?? 'algoseguroparalosblogtokensecretos';
        $jwtExpires = $_ENV['JWT_EXPIRES'] ?? getenv('JWT_EXPIRES') ?? '7d';

        $issuedAt = time();
        $expire = $issuedAt + self::parseExpireTime($jwtExpires);

        $payload = [
            'iat' => $issuedAt,
            'exp' => $expire,
            'id' => $userId,
            'username' => $username,
            'is_admin' => $isAdmin
        ];

        return JWT::encode($payload, $jwtSecret, 'HS256');
    }

    /**
     * Parsear tiempo de expiración
     */
    private static function parseExpireTime($expire)
    {
        if (preg_match('/(\d+)([hdm])/', $expire, $matches)) {
            $amount = (int)$matches[1];
            $unit = $matches[2];

            switch ($unit) {
                case 'h':
                    return $amount * 3600;
                case 'd':
                    return $amount * 86400;
                case 'm':
                    return $amount * 60;
                default:
                    return 604800; // 7 días por defecto
            }
        }

        return 604800;
    }
}
?>