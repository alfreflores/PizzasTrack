<?php
// ----------------------------------------------------
// 1. CONFIGURACIÓN INICIAL
// (Se mantiene igual)
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

// Función helper para calcular el estatus (stock)
function calcularEstatus(int $items): string {
    if ($items <= 5) {
        return 'rojo';
    } else if ($items <= 15) {
        return 'amarillo';
    } else {
        return 'verde';
    }
}

// ----------------------------------------------------
// 2. LÓGICA DE LECTURA (GET) - CORREGIDO
// ----------------------------------------------------
if ($method === 'GET') {
    try {
        $pdo = connectDB(); 
        $stmt = $pdo->query("
            SELECT 
                id_producto, 
                nombre AS producto, 
                stock_items AS items, 
                especificacion, 
                precio_unitario AS precio
                /* SELECCIONAMOS SÓLO LAS COLUMNAS QUE EXISTEN Y NECESITAMOS */
            FROM productos
            ORDER BY nombre ASC
        ");
        $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $data = array_map(function($p) {
            $estatus = calcularEstatus((int)$p['items']); 
            return [
                'id' => $p['id_producto'],
                'producto' => $p['producto'],
                'items' => (int)$p['items'],
                'especificacion' => $p['especificacion'],
                'precio' => '$' . number_format((float)$p['precio'], 2, '.', ''), 
                'estatus' => $estatus // Calculado
            ];
        }, $productos);

        echo json_encode(['success' => true, 'data' => $data]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al obtener productos: ' . $e->getMessage()]);
    }
    exit();
}

// ----------------------------------------------------
// 3. LÓGICA DE CREACIÓN (POST) - (Se mantiene la lógica de guardar en estatus_inventario)
// ----------------------------------------------------
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['producto'], $data['items'], $data['especificacion'], $data['precio'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Faltan campos requeridos para crear el producto.']);
        exit();
    }
    
    $producto = $data['producto'];
    $items = (int)$data['items'];
    $especificacion = $data['especificacion'];
    $precioUnitario = (float)str_replace(['$', ','], '', $data['precio']); 
    
    $estatusCalculado = calcularEstatus($items); 
    
    try {
        $pdo = connectDB(); 
        $stmt = $pdo->prepare("
            INSERT INTO productos (nombre, stock_items, especificacion, precio_unitario, estatus_inventario) 
            VALUES (:nombre, :stock_items, :especificacion, :precio_unitario, :estatus_inventario)
        ");
        
        $stmt->bindParam(':nombre', $producto);
        $stmt->bindParam(':stock_items', $items);
        $stmt->bindParam(':especificacion', $especificacion);
        $stmt->bindParam(':precio_unitario', $precioUnitario);
        $stmt->bindParam(':estatus_inventario', $estatusCalculado); 
        $stmt->execute();
        
        http_response_code(201);
        echo json_encode(['success' => true, 'message' => 'Producto creado exitosamente.', 'id' => $pdo->lastInsertId()]);
    } catch (\PDOException $e) {
        $msg = 'Error de base de datos al crear: ' . $e->getMessage();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $msg]);
    }
    exit();
}

// ----------------------------------------------------
// 4. LÓGICA DE ACTUALIZACIÓN (PUT)
// ----------------------------------------------------
if ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['id'], $data['producto'], $data['items'], $data['especificacion'], $data['precio'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Faltan campos requeridos para actualizar.']);
        exit();
    }
    
    $id = (int)$data['id'];
    $producto = $data['producto'];
    $items = (int)$data['items'];
    $especificacion = $data['especificacion'];
    $precioUnitario = (float)str_replace(['$', ','], '', $data['precio']);
    
    $estatusCalculado = calcularEstatus($items); 

    try {
        $pdo = connectDB(); 

        $stmt = $pdo->prepare("
            UPDATE productos SET 
                nombre = :nombre, 
                stock_items = :stock_items, 
                especificacion = :especificacion, 
                precio_unitario = :precio_unitario,
                estatus_inventario = :estatus_inventario
            WHERE id_producto = :id
        ");
        
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':nombre', $producto);
        $stmt->bindParam(':stock_items', $items);
        $stmt->bindParam(':especificacion', $especificacion);
        $stmt->bindParam(':precio_unitario', $precioUnitario);
        $stmt->bindParam(':estatus_inventario', $estatusCalculado); 

        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Producto actualizado exitosamente.']);
        } else {
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Producto encontrado, pero no se realizaron cambios.']);
        }
    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error de base de datos al actualizar: ' . $e->getMessage()]);
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
        echo json_encode(['success' => false, 'message' => 'Falta el ID del producto a eliminar.']);
        exit();
    }
    
    $id = (int)$data['id'];

    try {
        $pdo = connectDB(); 
        $stmt = $pdo->prepare("DELETE FROM productos WHERE id_producto = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Producto eliminado exitosamente.']);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Producto no encontrado.']);
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