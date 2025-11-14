<?php
// ----------------------------------------------------
// 1. CONFIGURACIÓN INICIAL
// ----------------------------------------------------

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/db_connection.php'; 
$method = $_SERVER['REQUEST_METHOD'];

// ----------------------------------------------------
// 2. LÓGICA DE LECTURA (GET) - CON JOIN
// ----------------------------------------------------
if ($method === 'GET') {
    try {
        $pdo = connectDB(); 
        
        $stmt = $pdo->query("
            SELECT 
                r.id_reporte,
                r.asunto,
                r.descripcion,
                r.fecha_creacion,
                r.estado,
                u.nombre AS nombre_trabajador,
                u.cargo AS puesto_trabajador
            FROM reportes_incidencias r
            JOIN usuarios u ON r.id_trabajador = u.id_usuario
            ORDER BY r.fecha_creacion DESC
        ");
        $incidencias = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Mapeamos los datos al formato del frontend
        $data = array_map(function($r) {
            return [
                'id_reporte' => (int)$r['id_reporte'],
                'asunto' => $r['asunto'],
                'descripcion' => $r['descripcion'],
                'fecha_creacion' => $r['fecha_creacion'],
                'estado' => $r['estado'],
                'nombre_trabajador' => $r['nombre_trabajador'],
                'puesto_trabajador' => $r['puesto_trabajador']
            ];
        }, $incidencias);

        echo json_encode(['success' => true, 'data' => $data]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al cargar las incidencias: ' . $e->getMessage()]);
    }
    exit();
}

// ----------------------------------------------------
// 3. LÓGICA DE CREACIÓN (POST)
// ----------------------------------------------------
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['id_trabajador'], $data['asunto'], $data['descripcion'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Faltan campos requeridos para el reporte.']);
        exit();
    }
    
    $id_trabajador = (int)$data['id_trabajador'];
    $asunto = $data['asunto'];
    $descripcion = $data['descripcion'];
    $estado_inicial = 'pendiente';
    
    try {
        $pdo = connectDB(); 
        $stmt = $pdo->prepare("
            INSERT INTO reportes_incidencias (id_trabajador, asunto, descripcion, estado) 
            VALUES (:id_trabajador, :asunto, :descripcion, :estado)
        ");
        
        $stmt->bindParam(':id_trabajador', $id_trabajador);
        $stmt->bindParam(':asunto', $asunto);
        $stmt->bindParam(':descripcion', $descripcion);
        $stmt->bindParam(':estado', $estado_inicial);
        $stmt->execute();
        
        http_response_code(201);
        echo json_encode(['success' => true, 'message' => 'Reporte de incidencia creado con éxito.']);
    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error de base de datos al crear el reporte: ' . $e->getMessage()]);
    }
    exit();
}

// ----------------------------------------------------
// 4. LÓGICA DE ACTUALIZACIÓN DE ESTADO (PUT)
// ----------------------------------------------------
if ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['id_reporte'], $data['estado'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Falta el ID del reporte o el nuevo estado.']);
        exit();
    }
    
    $id_reporte = (int)$data['id_reporte'];
    $nuevoEstado = $data['estado'];
    
    try {
        $pdo = connectDB(); 
        $stmt = $pdo->prepare("
            UPDATE reportes_incidencias SET estado = :estado WHERE id_reporte = :id_reporte
        ");
        
        $stmt->bindParam(':id_reporte', $id_reporte);
        $stmt->bindParam(':estado', $nuevoEstado);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => "Estado de reporte {$id_reporte} actualizado."]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Reporte no encontrado.']);
        }
    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error de base de datos al actualizar estado: ' . $e->getMessage()]);
    }
    exit();
}

// ----------------------------------------------------
// 5. LÓGICA DE ELIMINACIÓN (DELETE)
// ----------------------------------------------------
if ($method === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['id_reporte'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Falta el ID del reporte a eliminar.']);
        exit();
    }
    
    $id_reporte = (int)$data['id_reporte'];

    try {
        $pdo = connectDB(); 
        $stmt = $pdo->prepare("DELETE FROM reportes_incidencias WHERE id_reporte = :id_reporte");
        $stmt->bindParam(':id_reporte', $id_reporte);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Reporte de incidencia eliminado.']);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Reporte no encontrado.']);
        }
    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error de base de datos al eliminar: ' . $e->getMessage()]);
    }
    exit();
}

// ----------------------------------------------------
// 6. MÉTODO NO SOPORTADO
// ----------------------------------------------------
if (!in_array($method, ['GET', 'POST', 'PUT', 'DELETE'])) {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no soportado.']);
}
?>