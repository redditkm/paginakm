<?php

namespace App\Http\Controllers;

use App\Helpers\ResponseHelper;

class ContentController {
    private $pdo;
    private $response;

    public function __construct($pdo) {
        $this->pdo = $pdo;
        $this->response = new ResponseHelper();
    }

    /**
     * GET /api/contents - Obtener todos los contenidos (público)
     */
    public function getAll() {
        try {
            $stmt = $this->pdo->query("SELECT * FROM contents WHERE is_published = 1");
            $contents = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            
            $this->response->success($contents, 'Contenidos obtenidos');
        } catch (\Exception $e) {
            $this->response->error($e->getMessage(), 500);
        }
    }

    /**
     * GET /api/contents/{slug} - Obtener contenido por slug
     */
    public function getBySlug($slug) {
        try {
            $stmt = $this->pdo->prepare("SELECT * FROM contents WHERE slug = ? AND is_published = 1");
            $stmt->execute([$slug]);
            $content = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$content) {
                $this->response->error('Contenido no encontrado', 404);
                return;
            }

            $this->response->success($content, 'Contenido obtenido');
        } catch (\Exception $e) {
            $this->response->error($e->getMessage(), 500);
        }
    }

    /**
     * GET /api/contents/search - Buscar contenidos
     */
    public function search() {
        try {
            $q = $_GET['q'] ?? '';
            if (strlen($q) < 2) {
                $this->response->error('Query muy corto', 400);
                return;
            }

            $stmt = $this->pdo->prepare(
                "SELECT * FROM contents WHERE (title LIKE ? OR content LIKE ?) AND is_published = 1"
            );
            $stmt->execute(["%$q%", "%$q%"]);
            $contents = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            $this->response->success($contents, 'Búsqueda completada');
        } catch (\Exception $e) {
            $this->response->error($e->getMessage(), 500);
        }
    }

    /**
     * GET /admin/contents - Obtener todos (admin)
     */
    public function adminGetAll() {
        try {
            $type = $_GET['type'] ?? null;
            
            if ($type) {
                $stmt = $this->pdo->prepare("SELECT * FROM contents WHERE type = ?");
                $stmt->execute([$type]);
            } else {
                $stmt = $this->pdo->query("SELECT * FROM contents");
            }
            
            $contents = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            $this->response->success($contents, 'Contenidos obtenidos');
        } catch (\Exception $e) {
            $this->response->error($e->getMessage(), 500);
        }
    }

    /**
     * POST /admin/contents - Crear contenido
     */
    public function store() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);

            $stmt = $this->pdo->prepare(
                "INSERT INTO contents (slug, type, title, subtitle, content, metadata, featured_image, seo_description, seo_keywords, is_published)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
            );

            $stmt->execute([
                $data['slug'],
                $data['type'] ?? 'page',
                $data['title'],
                $data['subtitle'] ?? null,
                $data['content'],
                json_encode($data['metadata'] ?? []),
                $data['featured_image'] ?? null,
                $data['seo_description'] ?? null,
                $data['seo_keywords'] ?? null,
                $data['is_published'] ?? false
            ]);

            $this->response->success(['id' => $this->pdo->lastInsertId()], 'Contenido creado');
        } catch (\Exception $e) {
            $this->response->error($e->getMessage(), 500);
        }
    }

    /**
     * PUT /admin/contents/{id} - Actualizar contenido
     */
    public function update($id) {
        try {
            $data = json_decode(file_get_contents('php://input'), true);

            $stmt = $this->pdo->prepare(
                "UPDATE contents SET slug = ?, type = ?, title = ?, subtitle = ?, content = ?, metadata = ?, featured_image = ?, seo_description = ?, seo_keywords = ?, is_published = ? WHERE id = ?"
            );

            $stmt->execute([
                $data['slug'],
                $data['type'] ?? 'page',
                $data['title'],
                $data['subtitle'] ?? null,
                $data['content'],
                json_encode($data['metadata'] ?? []),
                $data['featured_image'] ?? null,
                $data['seo_description'] ?? null,
                $data['seo_keywords'] ?? null,
                $data['is_published'] ?? false,
                $id
            ]);

            $this->response->success([], 'Contenido actualizado');
        } catch (\Exception $e) {
            $this->response->error($e->getMessage(), 500);
        }
    }

    /**
     * DELETE /admin/contents/{id} - Eliminar contenido
     */
    public function delete($id) {
        try {
            $stmt = $this->pdo->prepare("DELETE FROM contents WHERE id = ?");
            $stmt->execute([$id]);

            $this->response->success([], 'Contenido eliminado');
        } catch (\Exception $e) {
            $this->response->error($e->getMessage(), 500);
        }
    }

    /**
     * PATCH /admin/contents/{id}/publish - Publicar/Despublicar
     */
    public function togglePublish($id) {
        try {
            $data = json_decode(file_get_contents('php://input'), true);

            $stmt = $this->pdo->prepare("UPDATE contents SET is_published = ? WHERE id = ?");
            $stmt->execute([$data['is_published'], $id]);

            $this->response->success([], 'Estado actualizado');
        } catch (\Exception $e) {
            $this->response->error($e->getMessage(), 500);
        }
    }

    /**
     * GET /admin/contents/stats - Estadísticas
     */
    public function getStats() {
        try {
            $total = $this->pdo->query("SELECT COUNT(*) as count FROM contents")->fetch()['count'];
            $published = $this->pdo->query("SELECT COUNT(*) as count FROM contents WHERE is_published = 1")->fetch()['count'];
            $drafts = $total - $published;

            $this->response->success([
                'total' => $total,
                'published' => $published,
                'drafts' => $drafts,
                'total_views' => 0
            ], 'Estadísticas obtenidas');
        } catch (\Exception $e) {
            $this->response->error($e->getMessage(), 500);
        }
    }
}