<?php

try {
    $pdo = new PDO(
        'mysql:host=localhost;dbname=paginakm_blog;charset=utf8mb4',
        'root',           // Usuario MySQL
        'KMdinival2024$',               // Contraseña (vacía si WAMP)
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
} catch (PDOException $e) {
    die('Error de conexión: ' . $e->getMessage());
}