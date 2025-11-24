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
// 2. LÓGICA DE LECTURA (GET) - CORREGIDA
// ----------------------------------------------------
if ($method === 'GET') {
    try {
        $pdo = connectDB(); 
        $stmt = $pdo->query("SELECT id_contacto, nombre, telefono, email, categoria, descripcion FROM contactos ORDER BY categoria, nombre ASC");
        $contactos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Mapear los nombres de la BD a los campos del Frontend
        $data = array_map(function($c) {
            $initials = strtoupper(substr($c['nombre'], 0, 1)) . strtoupper(substr(strstr($c['nombre'], ' '), 1, 1));
            return [
                'id' => $c['id_contacto'],
                'name' => $c['nombre'],
                'phone' => $c['telefono'],
                'email' => $c['email'],
                'tag' => $c['descripcion'] ?? 'Sin Etiqueta',
                'tipoContacto' => $c['categoria'], // Mapeo Correcto: DB categoria -> FE tipoContacto
                'profile' => [
                    'type' => 'initials', 
                    'value' => $initials,
                    'bgColor' => ($c['categoria'] === 'proveedor') ? 'bg-yellow-500' : 'bg-blue-500', 
                    'textColor' => 'text-white'
                ]
            ];
        }, $contactos);

        echo json_encode(['success' => true, 'data' => $data]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al obtener contactos: ' . $e->getMessage()]);
    }
    exit();
}

// ----------------------------------------------------
// 3. LÓGICA DE CREACIÓN (POST)
// ----------------------------------------------------
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    // Validamos los campos obligatorios del frontend
    if (!isset($data['name'], $data['phone'], $data['email'], $data['tipoContacto'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Faltan campos requeridos para crear el contacto (nombre, teléfono, email, tipoContacto).']);
        exit();
    }
    
    $nombre = $data['name'];
    $telefono = $data['phone'];
    $email = $data['email'];
    $categoria = $data['tipoContacto']; 
    $descripcion = $data['tag'] ?? null; // Si 'tag' no se envía, por defecto es NULL
    
    try {
        $pdo = connectDB(); 

        $stmt = $pdo->prepare("
            INSERT INTO contactos (nombre, telefono, email, categoria, descripcion) 
            VALUES (:nombre, :telefono, :email, :categoria, :descripcion)
        ");
        
        $stmt->bindParam(':nombre', $nombre);
        $stmt->bindParam(':telefono', $telefono);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':categoria', $categoria);
        $stmt->bindParam(':descripcion', $descripcion);

        $stmt->execute();
        
        http_response_code(201);
        echo json_encode(['success' => true, 'message' => 'Contacto creado exitosamente.', 'id' => $pdo->lastInsertId()]);
        
    } catch (\PDOException $e) {
        $msg = ($e->getCode() === '23000') ? 'Error: El email o teléfono ya existe (duplicado).' : 'Error de base de datos: ' . $e->getMessage();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $msg]);
    }
    exit();
}

// ----------------------------------------------------
// 4. LÓGICA DE ELIMINACIÓN (DELETE)
// ----------------------------------------------------
if ($method === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Falta el ID del contacto a eliminar.']);
        exit();
    }
    
    $id = $data['id'];

    try {
        $pdo = connectDB(); 
        $stmt = $pdo->prepare("DELETE FROM contactos WHERE id_contacto = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Contacto eliminado exitosamente.']);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Contacto no encontrado.']);
        }
    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error de base de datos al eliminar: ' . $e->getMessage()]);
    }
    exit();
}

// ----------------------------------------------------
// 5. LÓGICA DE ACTUALIZACIÓN (PUT)
// ----------------------------------------------------
if ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['id'], $data['name'], $data['phone'], $data['email'], $data['tipoContacto'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Faltan campos requeridos para actualizar.']);
        exit();
    }
    
    $id = $data['id'];
    $nombre = $data['name'];
    $telefono = $data['phone'];
    $email = $data['email'];
    $categoria = $data['tipoContacto']; // Mapeamos de tipoContacto (FE) a categoria (DB)
    $descripcion = $data['tag'] ?? null;
    
    try {
        $pdo = connectDB(); 

        $stmt = $pdo->prepare("
            UPDATE contactos SET 
                nombre = :nombre, 
                telefono = :telefono, 
                email = :email, 
                categoria = :categoria, 
                descripcion = :descripcion
            WHERE id_contacto = :id
        ");
        
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':nombre', $nombre);
        $stmt->bindParam(':telefono', $telefono);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':categoria', $categoria);
        $stmt->bindParam(':descripcion', $descripcion);

        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Contacto actualizado exitosamente.']);
        } else {
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Contacto encontrado, pero no se realizaron cambios.']);
        }
    } catch (\PDOException $e) {
        $msg = ($e->getCode() === '23000') ? 'Error: El email o teléfono ya existe (duplicado).' : 'Error de base de datos: ' . $e->getMessage();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $msg]);
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