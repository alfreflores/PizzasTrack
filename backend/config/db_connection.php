<?php
// backend/config/db_connection.php

require_once 'database.php'; // Incluye el archivo de credenciales

function connectDB() {
    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8';
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
    } catch (\PDOException $e) {
        // En un proyecto real, solo mostrarías un mensaje genérico en producción
        throw new \PDOException($e->getMessage(), (int)$e->getCode());
    }
}

// Para probar la conexión
// $conn = connectDB();
// echo "¡Conexión exitosa!";