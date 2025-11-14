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
                p.id_pedido, 
                p.fecha, 
                p.cantidad, 
                p.total, 
                p.estado,
                p.notas_adicionales,
                c.nombre AS proveedor_nombre,
                pr.nombre AS producto_nombre
            FROM pedidos p
            JOIN contactos c ON p.id_proveedor = c.id_contacto
            JOIN productos pr ON p.id_producto = pr.id_producto
            ORDER BY p.fecha DESC
        ");
        $ordenes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $data = array_map(function($o) {
            return [
                'id' => 'OC-' . str_pad($o['id_pedido'], 3, '0', STR_PAD_LEFT), // ID formateado para el frontend
                'id_pedido' => (int)$o['id_pedido'], // ID numérico para PUT/DELETE
                'proveedor_nombre' => $o['proveedor_nombre'],
                'producto_nombre' => $o['producto_nombre'],
                'fecha' => $o['fecha'],
                'cantidad' => (int)$o['cantidad'],
                'total' => (float)$o['total'],
                'estado' => $o['estado'],
                'notas_adicionales' => $o['notas_adicionales']
            ];
        }, $ordenes);

        echo json_encode(['success' => true, 'data' => $data]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al cargar las órdenes: ' . $e->getMessage()]);
    }
    exit();
}

// ----------------------------------------------------
// 3. LÓGICA DE CREACIÓN (POST)
// ----------------------------------------------------
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['id_proveedor'], $data['id_producto'], $data['fecha'], $data['cantidad'], $data['total'], $data['notas_adicionales'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Faltan campos requeridos para la orden.']);
        exit();
    }
    
    $id_proveedor = (int)$data['id_proveedor'];
    $id_producto = (int)$data['id_producto'];
    $fecha = $data['fecha'];
    $cantidad = (int)$data['cantidad'];
    $total = (float)$data['total'];
    $notas_adicionales = $data['notas_adicionales'];
    $estado_inicial = 'Solicitado'; 
    
    try {
        $pdo = connectDB(); 
        $stmt = $pdo->prepare("
            INSERT INTO pedidos (id_proveedor, id_producto, fecha, cantidad, total, estado, notas_adicionales) 
            VALUES (:id_proveedor, :id_producto, :fecha, :cantidad, :total, :estado, :notas_adicionales)
        ");
        
        $stmt->bindParam(':id_proveedor', $id_proveedor);
        $stmt->bindParam(':id_producto', $id_producto);
        $stmt->bindParam(':fecha', $fecha);
        $stmt->bindParam(':cantidad', $cantidad);
        $stmt->bindParam(':total', $total);
        $stmt->bindParam(':estado', $estado_inicial);
        $stmt->bindParam(':notas_adicionales', $notas_adicionales);
        $stmt->execute();
        
        http_response_code(201);
        echo json_encode(['success' => true, 'message' => 'Orden de compra generada como "Solicitado".', 'id' => $pdo->lastInsertId()]);
    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error de base de datos al crear la orden: ' . $e->getMessage()]);
    }
    exit();
}

// ----------------------------------------------------
// 4. LÓGICA DE ACTUALIZACIÓN DE ESTADO (PUT)
// ----------------------------------------------------
if ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['id'], $data['estado'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Falta el ID o el nuevo estado para la orden.']);
        exit();
    }
    
    $id = (int)$data['id'];
    $nuevoEstado = $data['estado'];
    
    try {
        $pdo = connectDB(); 
        $stmt = $pdo->prepare("
            UPDATE pedidos SET estado = :estado WHERE id_pedido = :id
        ");
        
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':estado', $nuevoEstado);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => "Estado de orden #OC-" . $id . " actualizado a {$nuevoEstado}."]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Orden no encontrada.']);
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

    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Falta el ID del pedido a eliminar.']);
        exit();
    }
    
    $id = (int)$data['id'];

    try {
        $pdo = connectDB(); 
        $stmt = $pdo->prepare("DELETE FROM pedidos WHERE id_pedido = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Pedido eliminado exitosamente.']);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Pedido no encontrado.']);
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