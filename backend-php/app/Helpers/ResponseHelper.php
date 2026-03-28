<?php

namespace App\Helpers;

class ResponseHelper
{
    /**
     * Respuesta exitosa
     */
    public function success($statusCode = 200, $data = null, $message = null)
    {
        $response = [];

        if ($message) {
            $response['message'] = $message;
        }

        if ($data !== null) {
            $response['data'] = $data;
        }

        return $this->send($statusCode, $response);
    }

    /**
     * Respuesta de error
     */
    public function error($statusCode = 400, $message = '', $errors = null)
    {
        $response = [
            'error' => $message
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        return $this->send($statusCode, $response);
    }

    /**
     * Respuesta con paginación
     */
    public function paginated($statusCode = 200, $data = [], $total = 0, $page = 1, $perPage = 15)
    {
        $response = [
            'data' => $data,
            'pagination' => [
                'total' => $total,
                'page' => (int)$page,
                'perPage' => (int)$perPage,
                'lastPage' => (int)ceil($total / $perPage)
            ]
        ];

        return $this->send($statusCode, $response);
    }

    /**
     * Enviar respuesta JSON
     */
    private function send($statusCode, $data)
    {
        header('Content-Type: application/json; charset=utf-8');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');

        http_response_code($statusCode);
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    /**
     * Respuesta 404
     */
    public function notFound($message = 'Recurso no encontrado')
    {
        return $this->error(404, $message);
    }

    /**
     * Respuesta 401 Unauthorized
     */
    public function unauthorized($message = 'No autorizado')
    {
        return $this->error(401, $message);
    }

    /**
     * Respuesta 403 Forbidden
     */
    public function forbidden($message = 'Acceso denegado')
    {
        return $this->error(403, $message);
    }

    /**
     * Respuesta 400 Bad Request
     */
    public function badRequest($message = 'Solicitud inválida')
    {
        return $this->error(400, $message);
    }

    /**
     * Respuesta 500 Server Error
     */
    public function serverError($message = 'Error interno del servidor')
    {
        return $this->error(500, $message);
    }

    /**
     * Respuesta 201 Created
     */
    public function created($data = null, $message = 'Recurso creado exitosamente')
    {
        return $this->success(201, $data, $message);
    }

    /**
     * Respuesta 204 No Content
     */
    public function noContent()
    {
        header('Content-Type: application/json');
        http_response_code(204);
        exit;
    }
}
?>