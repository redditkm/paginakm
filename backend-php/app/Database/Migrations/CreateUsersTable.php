<?php

namespace App\Database\Migrations;

use PDO;

class CreateUsersTable
{
    public static function up($pdo)
    {
        $sql = "
        CREATE TABLE IF NOT EXISTS users (
            id INT PRIMARY KEY AUTO_INCREMENT,
            username VARCHAR(100) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            is_admin BOOLEAN DEFAULT 0,
            is_active BOOLEAN DEFAULT 1,
            last_login TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_username (username),
            INDEX idx_email (email),
            INDEX idx_is_admin (is_admin)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ";

        try {
            $pdo->exec($sql);
            echo "✅ Tabla 'users' creada exitosamente\n";
            return true;
        } catch (\PDOException $e) {
            if (strpos($e->getMessage(), 'already exists') !== false) {
                echo "⚠️ Tabla 'users' ya existe\n";
                return true;
            }
            echo "❌ Error creando tabla: " . $e->getMessage() . "\n";
            return false;
        }
    }

    public static function down($pdo)
    {
        $sql = "DROP TABLE IF EXISTS users";
        
        try {
            $pdo->exec($sql);
            echo "✅ Tabla 'users' eliminada\n";
            return true;
        } catch (\PDOException $e) {
            echo "❌ Error eliminando tabla: " . $e->getMessage() . "\n";
            return false;
        }
    }

    /**
     * Seed con usuario admin por defecto
     */
    public static function seedDefaultUsers($pdo)
    {
        $users = [
            [
                'username' => 'admin',
                'email' => 'info@kmdinival.com',
                'password' => 'Admin123!@#',
                'is_admin' => 1
            ]
        ];

        try {
            $stmt = $pdo->prepare(
                "INSERT INTO users (username, email, password, is_admin, is_active) 
                 VALUES (?, ?, ?, ?, 1) 
                 ON DUPLICATE KEY UPDATE password = VALUES(password), is_admin = VALUES(is_admin)"
            );

            foreach ($users as $user) {
                // Hash con Argon2
                $hashed_password = password_hash($user['password'], PASSWORD_ARGON2ID, [
                    'memory_cost' => 2048,
                    'time_cost' => 4,
                    'threads' => 3
                ]);

                $stmt->execute([
                    $user['username'],
                    $user['email'],
                    $hashed_password,
                    $user['is_admin']
                ]);

                echo "✅ Usuario '{$user['username']}' creado/actualizado\n";
                echo "   📧 Email: {$user['email']}\n";
                echo "   🔒 Password: {$user['password']}\n";
                echo "   🛡️ Hasheada con Argon2\n";
            }

            return true;
        } catch (\PDOException $e) {
            echo "❌ Error insertando usuarios: " . $e->getMessage() . "\n";
            return false;
        }
    }
}

/**
 * Ejecutar desde CLI
 */
if (php_sapi_name() === 'cli') {

    // 🔥 RUTA CORREGIDA
    require_once dirname(__DIR__, 3) . '/config/database.php';

    echo "\n🔄 Ejecutando migración de usuarios...\n";

    if (!isset($pdo)) {
        die("❌ Error: \$pdo no está definido en database.php\n");
    }

    CreateUsersTable::up($pdo);
    CreateUsersTable::seedDefaultUsers($pdo);

    echo "✅ Migración completada\n\n";
}