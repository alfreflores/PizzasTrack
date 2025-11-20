<?php
// ----------------------------------------------------
// 1. CONFIGURACIÓN INICIAL
// ----------------------------------------------------

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE'); // Todos los métodos CRUD
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/db_connection.php'; 

$method = $_SERVER['REQUEST_METHOD'];

// ----------------------------------------------------
// 2. LÓGICA DE LECTURA (GET) - OBTENER TODOS LOS EMPLEADOS
// ----------------------------------------------------
if ($method === 'GET') {
    try {
        $pdo = connectDB(); 

        $stmt = $pdo->query("
            SELECT id_usuario, nombre, usuario, cargo, correo_electronico, horario_trabajo 
            FROM usuarios
            ORDER BY nombre ASC
        ");
        $empleados = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $data = array_map(function($emp) {
            return [
                'id' => $emp['id_usuario'],
                'nombre' => $emp['nombre'],
                'usuario' => $emp['usuario'],
                'cargo' => $emp['cargo'],
                'correo' => $emp['correo_electronico'],
                'horarioTrabajo' => $emp['horario_trabajo'],
                'contrasena' => '********' // Ocultamos la contraseña
            ];
        }, $empleados);

        echo json_encode(['success' => true, 'data' => $data]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al obtener usuarios: ' . $e->getMessage()]);
    }
    exit();
}

// ----------------------------------------------------
// 3. LÓGICA DE CREACIÓN (POST) - AÑADIR NUEVO EMPLEADO
// ----------------------------------------------------
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['nombre'], $data['usuario'], $data['contrasena'], $data['cargo'], $data['correo'], $data['horarioTrabajo'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Faltan campos requeridos para crear el usuario.']);
        exit();
    }
    
    $nombre = $data['nombre'];
    $usuario = $data['usuario'];
    $contrasenaHash = $data['contrasena']; // Contraseña plana temporalmente
    $cargo = $data['cargo'];
    $correo = $data['correo'];
    $horarioTrabajo = $data['horarioTrabajo'];
    
    try {
        $pdo = connectDB(); 

        $stmt = $pdo->prepare("
            INSERT INTO usuarios (nombre, usuario, contrasena_hash, cargo, correo_electronico, horario_trabajo) 
            VALUES (:nombre, :usuario, :contrasena_hash, :cargo, :correo, :horario_trabajo)
        ");
        
        $stmt->bindParam(':nombre', $nombre);
        $stmt->bindParam(':usuario', $usuario);
        $stmt->bindParam(':contrasena_hash', $contrasenaHash);
        $stmt->bindParam(':cargo', $cargo);
        $stmt->bindParam(':correo', $correo);
        $stmt->bindParam(':horario_trabajo', $horarioTrabajo);

        $stmt->execute();
        
        $nuevoId = $pdo->lastInsertId();

        http_response_code(201);
        echo json_encode([
            'success' => true, 
            'message' => 'Empleado creado exitosamente.',
            'id' => $nuevoId
        ]);

    } catch (\PDOException $e) {
        $msg = ($e->getCode() === '23000') ? 'Error: El usuario o correo electrónico ya existe.' : 'Error de base de datos: ' . $e->getMessage();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $msg]);
    }
    exit();
}

// ----------------------------------------------------
// 4. LÓGICA DE ACTUALIZACIÓN (PUT) - EDITAR EMPLEADO
// ----------------------------------------------------
if ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);

    // Los datos requeridos son los mismos, excepto que 'id' es obligatorio y 'contrasena' es opcional
    if (!isset($data['id'], $data['nombre'], $data['usuario'], $data['cargo'], $data['correo'], $data['horarioTrabajo'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Faltan campos requeridos para actualizar el usuario.']);
        exit();
    }
    
    $id = $data['id'];
    $nombre = $data['nombre'];
    $usuario = $data['usuario'];
    $cargo = $data['cargo'];
    $correo = $data['correo'];
    $horarioTrabajo = $data['horarioTrabajo'];
    
    try {
        $pdo = connectDB(); 

        $sql = "UPDATE usuarios SET nombre = :nombre, usuario = :usuario, cargo = :cargo, correo_electronico = :correo, horario_trabajo = :horario_trabajo";
        $params = [
            ':id' => $id,
            ':nombre' => $nombre,
            ':usuario' => $usuario,
            ':cargo' => $cargo,
            ':correo' => $correo,
            ':horario_trabajo' => $horarioTrabajo
        ];

        // Si se proporciona la contraseña, la actualizamos también
        if (isset($data['contrasena']) && !empty($data['contrasena'])) {
            $contrasenaHash = $data['contrasena']; 
            $sql .= ", contrasena_hash = :contrasena_hash";
            $params[':contrasena_hash'] = $contrasenaHash;
        }

        $sql .= " WHERE id_usuario = :id";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        
        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode([
                'success' => true, 
                'message' => 'Empleado actualizado exitosamente.'
            ]);
        } else {
            http_response_code(200);
            echo json_encode([
                'success' => false, 
                'message' => 'Empleado encontrado, pero no se realizaron cambios, o ID no existe.'
            ]);
        }

    } catch (\PDOException $e) {
        $msg = ($e->getCode() === '23000') ? 'Error: El usuario o correo electrónico ya existe (duplicado).' : 'Error de base de datos: ' . $e->getMessage();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $msg]);
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
        echo json_encode(['success' => false, 'message' => 'Falta el ID del usuario a eliminar.']);
        exit();
    }
    
    $id = $data['id'];

    try {
        $pdo = connectDB(); 
        
        // Regla de seguridad: No se elimina el ID 1
        if ($id == 1) {
             http_response_code(403);
             echo json_encode(['success' => false, 'message' => 'No puedes eliminar al usuario principal (ID 1).']);
             exit();
        }

        $stmt = $pdo->prepare("DELETE FROM usuarios WHERE id_usuario = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode([
                'success' => true, 
                'message' => 'Empleado eliminado exitosamente.'
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                'success' => false, 
                'message' => 'Empleado no encontrado.'
            ]);
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