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
// 2. LÓGICA DE LECTURA (GET) - OBTENER RECETAS O REPORTE DIARIO
// ----------------------------------------------------
if ($method === 'GET') {
    try {
        $pdo = connectDB(); 
        
        // --- A. LÓGICA DE REPORTE DIARIO ---
        if (isset($_GET['action']) && $_GET['action'] === 'daily_report') {
            
            // Define el inicio del día actual (considerando la zona horaria del servidor DB)
            $startOfDay = date('Y-m-d 00:00:00'); 

            // 1. Obtener el total de ventas del día
            $stmt_total = $pdo->prepare("
                SELECT SUM(total_venta) AS total_ventas_dia, COUNT(id_venta) AS total_ordenes
                FROM ventas_pizzas
                WHERE fecha_venta >= :startOfDay
            ");
            $stmt_total->bindParam(':startOfDay', $startOfDay);
            $stmt_total->execute();
            $summary = $stmt_total->fetch(PDO::FETCH_ASSOC);
            $totalVentas = (float)($summary['total_ventas_dia'] ?? 0);
            
            // 2. Obtener el detalle de ítems vendidos por receta (agrupado)
            $stmt_detail = $pdo->prepare("
                SELECT 
                    SUM(vd.cantidad_pizza) AS total_vendido,
                    pr.nombre,
                    pr.tamano
                FROM venta_detalle vd
                JOIN ventas_pizzas vp ON vd.id_venta = vp.id_venta
                JOIN pizzas_recetas pr ON vd.id_receta = pr.id_receta
                WHERE vp.fecha_venta >= :startOfDay
                GROUP BY pr.id_receta, pr.nombre, pr.tamano
                ORDER BY total_vendido DESC
            ");
            $stmt_detail->bindParam(':startOfDay', $startOfDay);
            $stmt_detail->execute();
            $detalleVentas = $stmt_detail->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true, 
                'data' => [
                    'totalVentas' => $totalVentas,
                    'detalle' => $detalleVentas
                ]
            ]);
            exit();

        } 
        
        // --- B. LÓGICA DE OBTENER RECETAS (DEFAULT) ---
        else {
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
        }
    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false, 
            'message' => 'Error de Base de Datos al cargar datos: ' . $e->getMessage()
        ]);
    }
    exit();
}

// ----------------------------------------------------
// 3. LÓGICA DE CREACIÓN DE RECETA O VENTA (POST)
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

            // A.1. PRE-VERIFICACIÓN DE STOCK y CÁLCULO DE CONSUMO
            $consumoTotal = [];
            
            // 1. Calcular consumo total de ingredientes y el total de la venta
            foreach ($items as $item) {
                $id_receta = (int)$item['id_receta'];
                $quantity = (int)$item['quantity'];
                $price = (float)$item['price'];
                $total_venta += $quantity * $price;
                
                // Obtener ingredientes de la receta
                $stmt_ingredientes = $pdo->prepare("
                    SELECT rd.cantidad_uso, p.id_producto
                    FROM receta_detalle rd
                    JOIN productos p ON rd.id_producto = p.id_producto
                    WHERE rd.id_receta = :id_receta
                ");
                $stmt_ingredientes->bindParam(':id_receta', $id_receta);
                $stmt_ingredientes->execute();
                $ingredientes = $stmt_ingredientes->fetchAll(PDO::FETCH_ASSOC);

                foreach ($ingredientes as $ing) {
                    $id_producto = (int)$ing['id_producto'];
                    $cantidad_uso = (float)$ing['cantidad_uso'];
                    $consumoTotal[$id_producto] = ($consumoTotal[$id_producto] ?? 0) + ($cantidad_uso * $quantity);
                }
            }

            // 2. Verificar Stock
            foreach ($consumoTotal as $id_producto => $cantidad_requerida) {
                $stmt_stock = $pdo->prepare("SELECT stock_items, nombre FROM productos WHERE id_producto = :id_producto");
                $stmt_stock->bindParam(':id_producto', $id_producto);
                $stmt_stock->execute();
                $producto_stock = $stmt_stock->fetch(PDO::FETCH_ASSOC);

                if (!$producto_stock || $producto_stock['stock_items'] < $cantidad_requerida) {
                    // Deshacer y reportar stock insuficiente
                    $pdo->rollBack();
                    http_response_code(409); // Conflict
                    echo json_encode([
                        'success' => false, 
                        'message' => 'Stock insuficiente de ' . ($producto_stock['nombre'] ?? 'un ingrediente desconocido') . '. Cantidad requerida: ' . $cantidad_requerida . '.'
                    ]);
                    exit();
                }
            }
            
            // A.2. EJECUCIÓN DE TRANSACCIÓN (Registro y Descuento)
            
            // a. Insertar Venta Principal
            $stmt_venta = $pdo->prepare("INSERT INTO ventas_pizzas (total_venta) VALUES (:total_venta)");
            $stmt_venta->bindParam(':total_venta', $total_venta);
            $stmt_venta->execute();
            $id_venta = $pdo->lastInsertId();

            // b. Insertar Detalles de Venta
            $stmt_detalle = $pdo->prepare("INSERT INTO venta_detalle (id_venta, id_receta, cantidad_pizza, precio_unitario) VALUES (:id_venta, :id_receta, :cantidad_pizza, :precio_unitario)");
            
            foreach ($items as $item) {
                $stmt_detalle->execute([
                    ':id_venta' => $id_venta,
                    ':id_receta' => (int)$item['id_receta'],
                    ':cantidad_pizza' => (int)$item['quantity'],
                    ':precio_unitario' => (float)$item['price'],
                ]);
            }

            // c. Actualizar Stock
            $stmt_stock_update = $pdo->prepare("
                UPDATE productos 
                SET stock_items = stock_items - :cantidad_usada 
                WHERE id_producto = :id_producto
            ");
            
            foreach ($consumoTotal as $id_producto => $cantidad_usada) {
                $stmt_stock_update->execute([
                    ':cantidad_usada' => $cantidad_usada,
                    ':id_producto' => $id_producto
                ]);
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
}
// ----------------------------------------------------
// 4. LÓGICA DE ACTUALIZACIÓN (PUT) - EDITAR RECETA Y SUS INGREDIENTES
// ----------------------------------------------------
if ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['id_receta'], $data['nombre'], $data['tamano'], $data['precio'], $data['ingredientes']) || !is_array($data['ingredientes'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Faltan campos requeridos para actualizar la receta.']);
        exit();
    }
    
    $id_receta = (int)$data['id_receta'];
    $nombre = $data['nombre'];
    $tamano = $data['tamano'];
    $precio = (float)$data['precio'];
    $ingredientes = $data['ingredientes'];

    try {
        $pdo = connectDB(); 
        $pdo->beginTransaction(); // INICIA LA TRANSACCIÓN

        // 1. Actualizar datos principales en pizzas_recetas
        $stmt_receta = $pdo->prepare("
            UPDATE pizzas_recetas SET nombre = :nombre, tamano = :tamano, precio = :precio
            WHERE id_receta = :id_receta
        ");
        $stmt_receta->bindParam(':id_receta', $id_receta);
        $stmt_receta->bindParam(':nombre', $nombre);
        $stmt_receta->bindParam(':tamano', $tamano);
        $stmt_receta->bindParam(':precio', $precio);
        $stmt_receta->execute();
        
        // 2. Eliminar todos los ingredientes existentes (Limpiar para re-insertar)
        $stmt_delete = $pdo->prepare("DELETE FROM receta_detalle WHERE id_receta = :id_receta");
        $stmt_delete->bindParam(':id_receta', $id_receta);
        $stmt_delete->execute();
        
        // 3. Insertar los nuevos ingredientes
        if (!empty($ingredientes)) {
            $stmt_insert = $pdo->prepare("
                INSERT INTO receta_detalle (id_receta, id_producto, cantidad_uso) 
                VALUES (:id_receta, :id_producto, :cantidad_uso)
            ");
            
            foreach ($ingredientes as $ingrediente) {
                if (!isset($ingrediente['id_producto']) || !isset($ingrediente['cantidad_uso'])) {
                     throw new Exception("Faltan datos en los ingredientes para la actualización.");
                }

                $id_producto = (int)$ingrediente['id_producto'];
                $cantidad_uso = (float)$ingrediente['cantidad_uso'];

                $stmt_insert->execute([
                    ':id_receta' => $id_receta,
                    ':id_producto' => $id_producto,
                    ':cantidad_uso' => $cantidad_uso,
                ]);
            }
        }
        
        $pdo->commit(); // CONFIRMA LA TRANSACCIÓN

        http_response_code(200);
        echo json_encode(['success' => true, 'message' => "Receta #{$id_receta} actualizada exitosamente (Detalles e Ingredientes)."]);

    } catch (\PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error de base de datos al actualizar la receta: ' . $e->getMessage()]);
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Error al procesar ingredientes: ' . $e->getMessage()]);
    }
    exit();
}

// ----------------------------------------------------
// 5. LÓGICA DE ELIMINACIÓN (DELETE) - ELIMINAR RECETA COMPLETA
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
        $pdo->beginTransaction(); // INICIA LA TRANSACCIÓN

        // 1. Eliminar ingredientes asociados (para evitar error de llave foránea)
        $stmt_detalle = $pdo->prepare("DELETE FROM receta_detalle WHERE id_receta = :id");
        $stmt_detalle->bindParam(':id', $id_receta);
        $stmt_detalle->execute();

        // 2. Eliminar la receta principal
        $stmt_receta = $pdo->prepare("DELETE FROM pizzas_recetas WHERE id_receta = :id");
        $stmt_receta->bindParam(':id', $id_receta);
        $stmt_receta->execute();
        
        $pdo->commit(); // CONFIRMA LA TRANSACCIÓN

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