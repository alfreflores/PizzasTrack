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
// 4. LÓGICA DE ACTUALIZACIÓN (PUT) - CORREGIDA PARA ACTUALIZAR ESTADO O CAMPO ÚNICO
// ----------------------------------------------------
if ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['id_pedido'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Falta el ID del pedido a actualizar.']);
        exit();
    }
    
    $id_pedido = (int)$data['id_pedido']; 

    try {
        $pdo = connectDB(); 

        // 1. OBTENER DATOS ACTUALES DEL PEDIDO
        $stmt_current = $pdo->prepare("
            SELECT id_proveedor, id_producto, fecha, cantidad, total, estado, notas_adicionales 
            FROM pedidos 
            WHERE id_pedido = :id_pedido
        ");
        $stmt_current->bindParam(':id_pedido', $id_pedido);
        $stmt_current->execute();
        $current_order = $stmt_current->fetch(PDO::FETCH_ASSOC);

        if (!$current_order) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Pedido no encontrado.']);
            exit();
        }

        // 2. FUSIONAR DATOS: Los datos nuevos (del frontend) sobrescriben los datos actuales
        $merged_data = [
            // Usa el valor enviado en $data, o si no existe, usa el valor actual de $current_order
            'id_proveedor' => (int)($data['id_proveedor'] ?? $current_order['id_proveedor']),
            'id_producto' => (int)($data['id_producto'] ?? $current_order['id_producto']),
            'fecha' => $data['fecha'] ?? $current_order['fecha'],
            'cantidad' => (int)($data['cantidad'] ?? $current_order['cantidad']),
            'total' => (float)($data['total'] ?? $current_order['total']),
            'estado' => $data['estado'] ?? $current_order['estado'], // Esto asegura que el estado se actualice
            'notas_adicionales' => $data['notas_adicionales'] ?? $current_order['notas_adicionales'],
        ];

        // 3. EJECUTAR ACTUALIZACIÓN
        $stmt = $pdo->prepare("
            UPDATE pedidos SET 
                id_proveedor = :id_proveedor, 
                id_producto = :id_producto, 
                fecha = :fecha, 
                cantidad = :cantidad, 
                total = :total, 
                estado = :estado,
                notas_adicionales = :notas_adicionales
            WHERE id_pedido = :id_pedido
        ");
        
        $stmt->bindParam(':id_pedido', $id_pedido);
        $stmt->bindParam(':id_proveedor', $merged_data['id_proveedor']);
        $stmt->bindParam(':id_producto', $merged_data['id_producto']);
        $stmt->bindParam(':fecha', $merged_data['fecha']);
        $stmt->bindParam(':cantidad', $merged_data['cantidad']);
        $stmt->bindParam(':total', $merged_data['total']);
        $stmt->bindParam(':estado', $merged_data['estado']);
        $stmt->bindParam(':notas_adicionales', $merged_data['notas_adicionales']);

        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => "Orden #OC-" . $id_pedido . " actualizada correctamente."]);
        } else {
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Orden encontrada, pero no se realizaron cambios.']);
        }
    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error de base de datos al actualizar la orden: ' . $e->getMessage()]);
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