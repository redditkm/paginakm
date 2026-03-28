<?php

namespace App\Models;

use PDO;
use PDOException;

class Content
{
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    /**
     * Obtener contenido por slug (público)
     */
    public function getBySlug($slug)
    {
        try {
            $sql = "SELECT * FROM contents WHERE slug = ? AND is_published = 1";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$slug]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result && is_string($result['metadata'])) {
                $result['metadata'] = json_decode($result['metadata'], true);
            }
            
            return $result;
        } catch (PDOException $e) {
            throw new \Exception("Error obteniendo contenido: " . $e->getMessage());
        }
    }

    /**
     * Obtener todos los contenidos (admin)
     */
    public function getAll($filters = [])
    {
        try {
            $sql = "SELECT id, slug, type, title, subtitle, format, is_published, created_at, updated_at FROM contents WHERE 1=1";
            $params = [];

            if (!empty($filters['type'])) {
                $sql .= " AND type = ?";
                $params[] = $filters['type'];
            }

            if (!empty($filters['published'])) {
                $sql .= " AND is_published = ?";
                $params[] = (int)$filters['published'];
            }

            $sql .= " ORDER BY created_at DESC";

            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new \Exception("Error obteniendo contenidos: " . $e->getMessage());
        }
    }

    /**
     * Obtener contenido por ID (admin)
     */
    public function getById($id)
    {
        try {
            $sql = "SELECT * FROM contents WHERE id = ?";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$id]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result && is_string($result['metadata'])) {
                $result['metadata'] = json_decode($result['metadata'], true);
            }
            
            return $result;
        } catch (PDOException $e) {
            throw new \Exception("Error obteniendo contenido: " . $e->getMessage());
        }
    }

    /**
     * Crear nuevo contenido
     */
    public function create($data)
    {
        try {
            $sql = "
            INSERT INTO contents 
            (slug, type, title, subtitle, content, format, metadata, featured_image, seo_description, seo_keywords, is_published, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ";

            $stmt = $this->db->prepare($sql);
            $metadata = is_array($data['metadata']) ? json_encode($data['metadata']) : $data['metadata'];

            $result = $stmt->execute([
                $data['slug'],
                $data['type'] ?? 'page',
                $data['title'],
                $data['subtitle'] ?? null,
                $data['content'],
                $data['format'] ?? 'html',
                $metadata,
                $data['featured_image'] ?? null,
                $data['seo_description'] ?? null,
                $data['seo_keywords'] ?? null,
                $data['is_published'] ?? 1,
                $data['created_by'] ?? null
            ]);

            return $this->db->lastInsertId();
        } catch (PDOException $e) {
            throw new \Exception("Error creando contenido: " . $e->getMessage());
        }
    }

    /**
     * Actualizar contenido
     */
    public function update($id, $data)
    {
        try {
            $sql = "
            UPDATE contents SET 
                slug = ?,
                type = ?,
                title = ?,
                subtitle = ?,
                content = ?,
                format = ?,
                metadata = ?,
                featured_image = ?,
                seo_description = ?,
                seo_keywords = ?,
                is_published = ?,
                updated_by = ?,
                updated_at = NOW()
            WHERE id = ?
            ";

            $stmt = $this->db->prepare($sql);
            $metadata = is_array($data['metadata']) ? json_encode($data['metadata']) : $data['metadata'];

            return $stmt->execute([
                $data['slug'],
                $data['type'] ?? 'page',
                $data['title'],
                $data['subtitle'] ?? null,
                $data['content'],
                $data['format'] ?? 'html',
                $metadata,
                $data['featured_image'] ?? null,
                $data['seo_description'] ?? null,
                $data['seo_keywords'] ?? null,
                $data['is_published'] ?? 1,
                $data['updated_by'] ?? null,
                $id
            ]);
        } catch (PDOException $e) {
            throw new \Exception("Error actualizando contenido: " . $e->getMessage());
        }
    }

    /**
     * Eliminar contenido
     */
    public function delete($id)
    {
        try {
            $sql = "DELETE FROM contents WHERE id = ?";
            $stmt = $this->db->prepare($sql);
            return $stmt->execute([$id]);
        } catch (PDOException $e) {
            throw new \Exception("Error eliminando contenido: " . $e->getMessage());
        }
    }

    /**
     * Buscar contenidos
     */
    public function search($query)
    {
        try {
            $sql = "
            SELECT id, slug, type, title, subtitle, format, is_published, created_at 
            FROM contents 
            WHERE (title LIKE ? OR slug LIKE ? OR content LIKE ?) AND is_published = 1
            LIMIT 20
            ";

            $searchTerm = "%{$query}%";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$searchTerm, $searchTerm, $searchTerm]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new \Exception("Error buscando contenidos: " . $e->getMessage());
        }
    }

    /**
     * Incrementar contador de vistas
     */
    public function incrementViews($id)
    {
        try {
            $sql = "UPDATE contents SET view_count = view_count + 1 WHERE id = ?";
            $stmt = $this->db->prepare($sql);
            return $stmt->execute([$id]);
        } catch (PDOException $e) {
            throw new \Exception("Error incrementando vistas: " . $e->getMessage());
        }
    }

    /**
     * Obtener contenidos por tipo
     */
    public function getByType($type)
    {
        try {
            $sql = "SELECT * FROM contents WHERE type = ? AND is_published = 1 ORDER BY created_at DESC";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$type]);
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($results as &$result) {
                if (is_string($result['metadata'])) {
                    $result['metadata'] = json_decode($result['metadata'], true);
                }
            }
            
            return $results;
        } catch (PDOException $e) {
            throw new \Exception("Error obteniendo contenidos por tipo: " . $e->getMessage());
        }
    }

    /**
     * Publicar/Despublicar contenido
     */
    public function togglePublish($id, $status)
    {
        try {
            $sql = "UPDATE contents SET is_published = ?, updated_at = NOW() WHERE id = ?";
            $stmt = $this->db->prepare($sql);
            return $stmt->execute([(int)$status, $id]);
        } catch (PDOException $e) {
            throw new \Exception("Error actualizando estado de publicación: " . $e->getMessage());
        }
    }

    /**
     * Obtener estadísticas
     */
    public function getStats()
    {
        try {
            $sql = "
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN is_published = 1 THEN 1 ELSE 0 END) as published,
                SUM(CASE WHEN is_published = 0 THEN 1 ELSE 0 END) as drafts,
                SUM(view_count) as total_views
            FROM contents
            ";

            $stmt = $this->db->query($sql);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new \Exception("Error obteniendo estadísticas: " . $e->getMessage());
        }
    }
}
?>