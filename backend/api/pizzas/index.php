<?php
// ----------------------------------------------------
// 1. CONFIGURACIÓN INICIAL
// ----------------------------------------------------

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); 
// AÑADIDO: PUT y DELETE para el CRUD de Recetas
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/db_connection.php'; 
$method = $_SERVER['REQUEST_METHOD'];

// ----------------------------------------------------
// 2. LÓGICA DE LECTURA (GET) - OBTENER RECETAS Y DETALLES
// ----------------------------------------------------
if ($method === 'GET') {
    try {
        $pdo = connectDB(); 
        
        $stmt_recetas = $pdo->query("
            SELECT id_receta, nombre, tamano, precio FROM pizzas_recetas ORDER BY nombre, tamano DESC
        ");
        $recetas = $stmt_recetas->fetchAll(PDO::FETCH_ASSOC);

        $data = [];
        foreach ($recetas as $receta) {
            $id_receta = (int)$receta['id_receta'];
            
            $stmt_detalle = $pdo->prepare("
                SELECT rd.cantidad_uso, p.id_producto, p.nombre AS producto_nombre, p.especificacion
                FROM receta_detalle rd
                JOIN productos p ON rd.id_producto = p.id_producto
                WHERE rd.id_receta = :id_receta
            ");
            $stmt_detalle->bindParam(':id_receta', $id_receta);
            $stmt_detalle->execute();
            $ingredientes = $stmt_detalle->fetchAll(PDO::FETCH_ASSOC);

            $data[] = [
                'id_receta' => $id_receta,
                'nombre' => $receta['nombre'],
                'tamano' => $receta['tamano'],
                'precio' => (float)$receta['precio'],
                'ingredientes' => array_map(function($ing) {
                    return [
                        'id_producto' => (int)$ing['id_producto'],
                        'producto_nombre' => $ing['producto_nombre'],
                        'cantidad_uso' => (float)$ing['cantidad_uso'],
                        'unidad_medida' => $ing['especificacion'] 
                    ];
                }, $ingredientes)
            ];
        }

        echo json_encode(['success' => true, 'data' => $data]);
    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false, 
            'message' => 'Error de Base de Datos al cargar recetas. Mensaje DB: ' . $e->getMessage()
        ]);
    }
    exit();
}

// ----------------------------------------------------
// 3. LÓGICA DE CREACIÓN DE RECETA O VENTA (POST)
// NOTA: Se usará POST para la venta Y para la creación de nuevas recetas.
// La lógica distingue por los campos recibidos.
// ----------------------------------------------------
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    // --- A. LÓGICA DE VENTA DE PIZZA (SI RECIBE 'items') ---
    if (isset($data['items']) && is_array($data['items'])) {
        $items = $data['items'];
        $total_venta = 0;
        
        try {
            $pdo = connectDB(); 
            $pdo->beginTransaction();

            // --- A.1. PRE-VERIFICACIÓN DE STOCK y CÁLCULO DE CONSUMO ---
            // (La lógica es idéntica a la anterior, se asegura que haya stock antes de la transacción)
            $consumo_total = [];
            $receta_ids = array_unique(array_column($items, 'id_receta'));
            $placeholders = implode(',', array_fill(0, count($receta_ids), '?'));
            
            // Usamos UNLOCK TABLES implícitamente por el COMMIT/ROLLBACK
            $stmt_recipes = $pdo->prepare("
                SELECT rd.id_receta, rd.id_producto, rd.cantidad_uso, p.stock_items 
                FROM receta_detalle rd
                JOIN productos p ON rd.id_producto = p.id_producto
                WHERE rd.id_receta IN ({$placeholders})
            ");
            $stmt_recipes->execute($receta_ids);
            $recetas_db = $stmt_recipes->fetchAll(PDO::FETCH_ASSOC);

            $recetas_map = [];
            foreach ($recetas_db as $row) {
                $receta_id = $row['id_receta'];
                if (!isset($recetas_map[$receta_id])) {
                    $recetas_map[$receta_id] = ['stock_items' => [], 'ingredientes' => []];
                }
                $recetas_map[$receta_id]['ingredientes'][] = $row;
                $recetas_map[$receta_id]['stock_items'][$row['id_producto']] = (int)$row['stock_items'];
            }

            foreach ($items as $item) {
                $id_receta = (int)$item['id_receta'];
                $cantidad_pizza = (int)$item['quantity'];
                $precio_unitario = (float)$item['price'];
                $total_venta += $precio_unitario * $cantidad_pizza;
                
                if (!isset($recetas_map[$id_receta])) {
                    $pdo->rollBack();
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => "Receta ID {$id_receta} no encontrada en la base de datos."]);
                    exit();
                }

                foreach ($recetas_map[$id_receta]['ingredientes'] as $ingrediente) {
                    $id_producto = (int)$ingrediente['id_producto'];
                    $uso_por_unidad = (float)$ingrediente['cantidad_uso'];
                    $consumo_requerido = $uso_por_unidad * $cantidad_pizza;
                    
                    $consumo_total[$id_producto] = ($consumo_total[$id_producto] ?? 0) + $consumo_requerido;
                    $stock_actual = $recetas_map[$id_receta]['stock_items'][$id_producto];

                    if ($consumo_total[$id_producto] > $stock_actual) {
                        $pdo->rollBack();
                        http_response_code(409); 
                        echo json_encode(['success' => false, 'message' => "Stock insuficiente para el Producto ID {$id_producto}. Stock disponible: {$stock_actual}"]);
                        exit();
                    }
                }
            }
            
            // --- A.2. EJECUCIÓN DE TRANSACCIÓN (Venta y Descuento) ---
            $stmt_venta = $pdo->prepare("INSERT INTO ventas_pizzas (total_venta) VALUES (:total_venta)");
            $stmt_venta->bindParam(':total_venta', $total_venta);
            $stmt_venta->execute();
            $id_venta = $pdo->lastInsertId();

            $stmt_detalle = $pdo->prepare("INSERT INTO venta_detalle (id_venta, id_receta, cantidad_pizza, precio_unitario) VALUES (:id_venta, :id_receta, :cantidad_pizza, :precio_unitario)");
            
            foreach ($items as $item) {
                $id_receta = (int)$item['id_receta'];
                $cantidad_pizza = (int)$item['quantity'];
                $precio_unitario = (float)$item['price'];
                $stmt_detalle->bindParam(':id_venta', $id_venta);
                $stmt_detalle->bindParam(':id_receta', $id_receta);
                $stmt_detalle->bindParam(':cantidad_pizza', $cantidad_pizza);
                $stmt_detalle->bindParam(':precio_unitario', $precio_unitario);
                $stmt_detalle->execute();
            }

            $stmt_stock = $pdo->prepare("UPDATE productos SET stock_items = stock_items - :consumo WHERE id_producto = :id_producto");
            
            foreach ($consumo_total as $id_producto => $consumo) {
                $stmt_stock->bindParam(':consumo', $consumo);
                $stmt_stock->bindParam(':id_producto', $id_producto);
                $stmt_stock->execute();
            }

            $pdo->commit(); 
            http_response_code(201);
            echo json_encode(['success' => true, 'message' => 'Venta registrada y stock actualizado con éxito.', 'id_venta' => $id_venta]);
            exit();

        } catch (\PDOException $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode([
                'success' => false, 
                'message' => 'Error DB al procesar la venta: ' . $e->getMessage()
            ]);
            exit();
        } catch (Exception $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error de servidor: ' . $e->getMessage()]);
            exit();
        }
    } 
    
    // --- B. LÓGICA DE CREACIÓN DE RECETA (SI RECIBE 'nombre') ---
    else if (isset($data['nombre'], $data['tamano'], $data['precio'])) {
        
        if (!isset($data['ingredientes']) || !is_array($data['ingredientes']) || empty($data['ingredientes'])) {
             http_response_code(400);
             echo json_encode(['success' => false, 'message' => 'Faltan detalles de ingredientes para crear la receta.']);
             exit();
        }

        $nombre = $data['nombre'];
        $tamano = $data['tamano'];
        $precio = (float)$data['precio'];
        $ingredientes = $data['ingredientes'];
        
        try {
            $pdo = connectDB(); 
            $pdo->beginTransaction();
            
            // 1. Insertar en pizzas_recetas
            $stmt_receta = $pdo->prepare("
                INSERT INTO pizzas_recetas (nombre, tamano, precio) VALUES (:nombre, :tamano, :precio)
            ");
            $stmt_receta->bindParam(':nombre', $nombre);
            $stmt_receta->bindParam(':tamano', $tamano);
            $stmt_receta->bindParam(':precio', $precio);
            $stmt_receta->execute();
            $id_receta = $pdo->lastInsertId();

            // 2. Insertar en receta_detalle
            $stmt_detalle = $pdo->prepare("
                INSERT INTO receta_detalle (id_receta, id_producto, cantidad_uso) 
                VALUES (:id_receta, :id_producto, :cantidad_uso)
            ");
            foreach ($ingredientes as $ing) {
                $id_producto = (int)$ing['id_producto'];
                $cantidad_uso = (float)$ing['cantidad_uso'];
                
                $stmt_detalle->bindParam(':id_receta', $id_receta);
                $stmt_detalle->bindParam(':id_producto', $id_producto);
                $stmt_detalle->bindParam(':cantidad_uso', $cantidad_uso);
                $stmt_detalle->execute();
            }

            $pdo->commit();
            http_response_code(201);
            echo json_encode(['success' => true, 'message' => 'Receta creada exitosamente.', 'id_receta' => $id_receta]);
            exit();

        } catch (\PDOException $e) {
            $pdo->rollBack();
            $msg = ($e->getCode() === '23000') ? 'Error: Ya existe una pizza con ese nombre y tamaño.' : 'Error DB al crear receta: ' . $e->getMessage();
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $msg]);
            exit();
        }
    }

    // Si POST no contiene ni 'items' ni 'nombre', es un error de formato.
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Faltan datos requeridos para POST.']);
    exit();
}

// ----------------------------------------------------
// 4. LÓGICA DE ACTUALIZACIÓN (PUT) - EDITAR RECETA
// ----------------------------------------------------
if ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['id_receta'], $data['nombre'], $data['tamano'], $data['precio'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Faltan campos principales para actualizar la receta.']);
        exit();
    }
    
    $id_receta = (int)$data['id_receta'];
    $nombre = $data['nombre'];
    $tamano = $data['tamano'];
    $precio = (float)$data['precio'];
    $ingredientes = $data['ingredientes'] ?? []; // Puede ser un array vacío si solo edita el nombre/precio
    
    try {
        $pdo = connectDB(); 
        $pdo->beginTransaction();

        // 1. Actualizar pizzas_recetas
        $stmt_receta = $pdo->prepare("
            UPDATE pizzas_recetas SET nombre = :nombre, tamano = :tamano, precio = :precio WHERE id_receta = :id_receta
        ");
        $stmt_receta->bindParam(':id_receta', $id_receta);
        $stmt_receta->bindParam(':nombre', $nombre);
        $stmt_receta->bindParam(':tamano', $tamano);
        $stmt_receta->bindParam(':precio', $precio);
        $stmt_receta->execute();

        // 2. Si se proporcionaron ingredientes, actualizar receta_detalle
        if (!empty($ingredientes)) {
            // A. Eliminar detalles viejos
            $stmt_delete_detalle = $pdo->prepare("DELETE FROM receta_detalle WHERE id_receta = :id_receta");
            $stmt_delete_detalle->bindParam(':id_receta', $id_receta);
            $stmt_delete_detalle->execute();
            
            // B. Insertar detalles nuevos
            $stmt_detalle = $pdo->prepare("
                INSERT INTO receta_detalle (id_receta, id_producto, cantidad_uso) 
                VALUES (:id_receta, :id_producto, :cantidad_uso)
            ");
            foreach ($ingredientes as $ing) {
                $id_producto = (int)$ing['id_producto'];
                $cantidad_uso = (float)$ing['cantidad_uso'];
                
                $stmt_detalle->bindParam(':id_receta', $id_receta);
                $stmt_detalle->bindParam(':id_producto', $id_producto);
                $stmt_detalle->bindParam(':cantidad_uso', $cantidad_uso);
                $stmt_detalle->execute();
            }
        }

        $pdo->commit();
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Receta actualizada exitosamente.', 'id_receta' => $id_receta]);

    } catch (\PDOException $e) {
        $pdo->rollBack();
        $msg = ($e->getCode() === '23000') ? 'Error: Ya existe una pizza con ese nombre y tamaño.' : 'Error DB al actualizar receta: ' . $e->getMessage();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $msg]);
    }
    exit();
}

// ----------------------------------------------------
// 5. LÓGICA DE ELIMINACIÓN (DELETE) - ELIMINAR RECETA
// ----------------------------------------------------
if ($method === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['id_receta'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Falta el ID de la receta a eliminar.']);
        exit();
    }
    
    $id_receta = (int)$data['id_receta'];

    try {
        $pdo = connectDB(); 
        $pdo->beginTransaction();

        // 1. Eliminar de venta_detalle (si existe, para no romper la FK de venta)
        $stmt_delete_venta = $pdo->prepare("DELETE FROM venta_detalle WHERE id_receta = :id_receta");
        $stmt_delete_venta->bindParam(':id_receta', $id_receta);
        $stmt_delete_venta->execute();

        // 2. Eliminar de receta_detalle
        $stmt_delete_detalle = $pdo->prepare("DELETE FROM receta_detalle WHERE id_receta = :id_receta");
        $stmt_delete_detalle->bindParam(':id_receta', $id_receta);
        $stmt_delete_detalle->execute();
        
        // 3. Eliminar de pizzas_recetas
        $stmt_receta = $pdo->prepare("DELETE FROM pizzas_recetas WHERE id_receta = :id_receta");
        $stmt_receta->bindParam(':id_receta', $id_receta);
        $stmt_receta->execute();
        
        $pdo->commit();

        if ($stmt_receta->rowCount() > 0) {
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Receta eliminada exitosamente.']);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Receta no encontrada.']);
        }

    } catch (\PDOException $e) {
        $pdo->rollBack();
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