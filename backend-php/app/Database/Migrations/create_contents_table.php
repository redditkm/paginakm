<?php

namespace App\Database\Migrations;

use PDO;

class CreateContentsTable
{
    public static function up($pdo)
    {
        $sql = "
        CREATE TABLE IF NOT EXISTS contents (
            id INT PRIMARY KEY AUTO_INCREMENT,
            slug VARCHAR(255) UNIQUE NOT NULL,
            type VARCHAR(100) NOT NULL DEFAULT 'page',
            title VARCHAR(255) NOT NULL,
            subtitle VARCHAR(255) NULL,
            content LONGTEXT NOT NULL,
            format VARCHAR(50) NOT NULL DEFAULT 'html',
            metadata JSON NULL,
            featured_image VARCHAR(255) NULL,
            is_published BOOLEAN DEFAULT 1,
            seo_description VARCHAR(255) NULL,
            seo_keywords VARCHAR(255) NULL,
            view_count INT DEFAULT 0,
            created_by INT NULL,
            updated_by INT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
            FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
            INDEX idx_slug (slug),
            INDEX idx_type (type),
            INDEX idx_published (is_published),
            INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ";

        try {
            $pdo->exec($sql);
            echo "✅ Tabla 'contents' creada exitosamente\n";
            return true;
        } catch (\PDOException $e) {
            echo "❌ Error creando tabla: " . $e->getMessage() . "\n";
            return false;
        }
    }

    public static function down($pdo)
    {
        $sql = "DROP TABLE IF EXISTS contents";
        
        try {
            $pdo->exec($sql);
            echo "✅ Tabla 'contents' eliminada\n";
            return true;
        } catch (\PDOException $e) {
            echo "❌ Error eliminando tabla: " . $e->getMessage() . "\n";
            return false;
        }
    }

    public static function seedDefaultContents($pdo, $adminUserId = 1)
    {
        $defaultContents = [
            [
                'slug' => 'privacy-policy',
                'type' => 'legal',
                'title' => 'Política de Privacidad',
                'subtitle' => 'KM Dinival Insurance',
                'content' => '<p>En <strong>KM Dinival Insurance</strong>, respetamos y protegemos su información personal.</p>',
                'metadata' => json_encode(['font' => 'Arial', 'fontSize' => '16px', 'alignment' => 'left']),
                'seo_description' => 'Política de privacidad',
                'seo_keywords' => 'privacidad, datos'
            ]
        ];

        $sql = "
        INSERT INTO contents (slug, type, title, subtitle, content, format, metadata, is_published, seo_description, seo_keywords, created_by)
        VALUES (?, ?, ?, ?, ?, 'html', ?, 1, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            title = VALUES(title),
            content = VALUES(content),
            metadata = VALUES(metadata),
            updated_by = ?
        ";

        try {
            $stmt = $pdo->prepare($sql);
            foreach ($defaultContents as $content) {
                $stmt->execute([
                    $content['slug'],
                    $content['type'],
                    $content['title'],
                    $content['subtitle'],
                    $content['content'],
                    $content['metadata'],
                    $content['seo_description'],
                    $content['seo_keywords'],
                    $adminUserId,
                    $adminUserId
                ]);
            }
            echo "✅ Contenidos por defecto insertados\n";
            return true;
        } catch (\PDOException $e) {
            echo "❌ Error insertando contenidos: " . $e->getMessage() . "\n";
            return false;
        }
    }
}

# 🚀 EJECUCIÓN DESDE CONSOLA
if (php_sapi_name() === 'cli') {

    // ✅ RUTA CORRECTA FINAL (SUBE 3 NIVELES)
    $dbPath = dirname(__DIR__, 3) . '/config/database.php';

    if (!file_exists($dbPath)) {
        die("❌ No se encontró database.php en: $dbPath\n");
    }

    require_once $dbPath;

    if (!isset($pdo)) {
        die("❌ \$pdo no está definido en database.php\n");
    }

    echo "\n🔄 Ejecutando migración...\n";
    CreateContentsTable::up($pdo);
    CreateContentsTable::seedDefaultContents($pdo, 1);
    echo "✅ Migración completada\n\n";
}