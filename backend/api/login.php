<?php
// ----------------------------------------------------
// 1. CONFIGURACIÓN INICIAL Y CONEXIÓN
// ----------------------------------------------------

// Encabezados para permitir que React acceda a esta API (CORS)
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar pre-vuelo de CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Incluye la configuración de la base de datos
// ASEGÚRATE DE QUE ESTA RUTA SEA CORRECTA (normalmente es '../config/db_connection.php')
require_once '../config/db_connection.php'; 

// ----------------------------------------------------
// 2. PROCESAR DATOS DE ENTRADA
// ----------------------------------------------------

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
    exit();
}

// Decodificar los datos JSON enviados por el frontend de React
$data = json_decode(file_get_contents('php://input'), true);

// Verificamos que recibimos los campos 'usuario' y 'password'
if (!isset($data['usuario']) || !isset($data['password'])) {
    http_response_code(400); 
    echo json_encode(['success' => false, 'message' => 'Faltan credenciales (usuario o password).']);
    exit();
}

$inputUsuario = $data['usuario'];
$inputPassword = $data['password'];

// ----------------------------------------------------
// 3. CONSULTA A LA BASE DE DATOS Y VERIFICACIÓN
// ----------------------------------------------------

try {
    $pdo = connectDB(); 

    // Consulta segura buscando el usuario por la columna 'usuario'
    $stmt = $pdo->prepare("
        SELECT id_usuario, nombre, contrasena_hash, cargo 
        FROM usuarios 
        WHERE usuario = :usuario"
    );
    $stmt->bindParam(':usuario', $inputUsuario);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // Validación de la contraseña (¡Recuerda usar password_verify en producción!)
        if ($inputPassword === $user['contrasena_hash']) {

            // Respuesta de éxito para React
            echo json_encode([
                'success' => true,
                'message' => 'Inicio de sesión exitoso.',
                'user' => [
                    // Mapeamos las columnas de la DB a los nombres de campos de tu interfaz User
                    'id' => $user['id_usuario'],
                    'name' => $user['nombre'],
                    'role' => $user['cargo'],
                ]
            ]);
            exit();
        }
    }

    // Si no se encontró usuario o la contraseña es incorrecta
    http_response_code(401); 
    echo json_encode(['success' => false, 'message' => 'Usuario o contraseña incorrectos.']);

} catch (Exception $e) {
    // Manejo de errores de la BD o del servidor
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error del servidor: ' . $e->getMessage()]);
}

?>