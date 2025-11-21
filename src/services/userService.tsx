// src/services/userService.ts

// ** URL de tu API de Usuarios **
// ¡Asegúrate de que esta ruta coincida con la ubicación real de tu index.php!
const API_URL_USERS = 'http://localhost/Pizzatrack/backend/api/users/index.php';

// Interfaz para los datos que enviamos/recibimos
export interface EmpleadoData {
  id?: number; 
  nombre: string;
  usuario: string;
  contrasena?: string;
  cargo: string;
  correo: string;
  horarioTrabajo: string;
}

// Interfaz para la respuesta del API (incluye el flag de éxito)
interface ApiResponse<T = EmpleadoData[]> { // Tipado genérico para claridad
  success: boolean;
  data?: T;
  message: string;
}

// ---------------------------
// A. FUNCIÓN DE LECTURA (GET) - CORREGIDA
// ---------------------------
export const getEmpleados = async (): Promise<ApiResponse<EmpleadoData[]>> => {
    try {
        const response = await fetch(API_URL_USERS);

        if (!response.ok) {
            return { success: false, message: `Error HTTP: ${response.status}` };
        }

        const json = await response.json();
        
        // ** CLAVE: Extraemos data.data si existe, sino, devolvemos el objeto original **
        if (json.success) {
            return { success: true, data: json.data as EmpleadoData[], message: json.message };
        }
        
        return json as ApiResponse<EmpleadoData[]>;

    } catch (error) {
        console.error("Error en getEmpleados:", error);
        return { success: false, message: 'Fallo de conexión con el servidor (Usuarios).' };
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
