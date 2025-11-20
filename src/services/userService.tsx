// src/services/userService.ts

// ** URL de tu API de Usuarios **
// ¡Asegúrate de que esta ruta coincida con la ubicación real de tu index.php!
const API_URL_USERS = 'http://localhost/Pizzatrack/backend/api/users/index.php';

// Interfaz para los datos que enviamos/recibimos
export interface EmpleadoData {
  id?: number; // <--- DEBE SER OPCIONAL AQUÍ
  nombre: string;
  usuario: string;
  contrasena?: string;
  cargo: string;
  correo: string;
  horarioTrabajo: string;
}

// Interfaz para la respuesta del API (incluye el flag de éxito)
interface ApiResponse {
  success: boolean;
  data?: EmpleadoData[];
  message: string;
}

// ---------------------------
// A. FUNCIÓN DE LECTURA (GET)
// ---------------------------
export const getEmpleados = async (): Promise<ApiResponse> => {
    try {
        const response = await fetch(API_URL_USERS);

        // Si la respuesta HTTP no es 200, lanzar error
        if (!response.ok) {
            return { success: false, message: `Error HTTP: ${response.status}` };
        }

        const data = await response.json();
        return data as ApiResponse;

    } catch (error) {
        console.error("Error en getEmpleados:", error);
        return { success: false, message: 'Fallo de conexión con el servidor.' };
    }
};

// ---------------------------
// B. FUNCIÓN DE CREACIÓN (POST)
// ---------------------------
export const createEmpleado = async (empleado: Omit<EmpleadoData, 'id'>): Promise<ApiResponse> => {
    try {
        const response = await fetch(API_URL_USERS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(empleado),
        });

        const data = await response.json();
        return data as ApiResponse;
        
    } catch (error) {
        console.error("Error en createEmpleado:", error);
        return { success: false, message: 'Fallo de conexión con el servidor.' };
    }
};

// ---------------------------
// C. FUNCIÓN DE ELIMINACIÓN (DELETE)
// ---------------------------
export const deleteEmpleado = async (id: number): Promise<ApiResponse> => {
    try {
        const response = await fetch(API_URL_USERS, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: id }),
        });

        const data = await response.json();
        return data as ApiResponse;

    } catch (error) {
        console.error("Error en deleteEmpleado:", error);
        return { success: false, message: 'Fallo de conexión con el servidor.' };
    }
};

// ---------------------------
// D. FUNCIÓN DE ACTUALIZACIÓN (PUT)
// ---------------------------
export const updateEmpleado = async (empleado: EmpleadoData & { id: number }): Promise<ApiResponse> => {
    try {
        const response = await fetch(API_URL_USERS, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(empleado),
        });

        const data = await response.json();
        return data as ApiResponse;
        
    } catch (error) {
        console.error("Error en updateEmpleado:", error);
        return { success: false, message: 'Fallo de conexión con el servidor.' };
    }
};
