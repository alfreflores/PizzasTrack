const API_URL_INCIDENCIAS = 'http://localhost/Pizzatrack/backend/api/incidencias/index.php'; 
const API_URL_USERS = 'http://localhost/Pizzatrack/backend/api/users/index.php'; // Para obtener la lista de trabajadores

export type ReporteEstado = 'pendiente' | 'en_proceso' | 'resuelto' | 'cerrado';

export interface IncidenciaData {
    id_reporte: number;
    id_trabajador: number;
    asunto: string;
    descripcion: string;
    fecha_creacion: string; // ISO format
    estado: ReporteEstado;
    
    // Campos para el frontend (JOIN)
    nombre_trabajador: string;
    puesto_trabajador: string;
}

interface ApiResponse {
    success: boolean;
    data?: IncidenciaData[] | { id: number, name: string, puesto: string }[]; 
    message: string;
}

// --- LECTURA (GET) ---
export const getIncidencias = async (): Promise<ApiResponse> => {
    try {
        const response = await fetch(API_URL_INCIDENCIAS);
        const data = await response.json();
        return data as ApiResponse;
    } catch (_error) { 
        console.error("Error en getIncidencias:", _error);
        return { success: false, message: 'Fallo al cargar las incidencias.' };
    }
};

// --- OBTENER TRABAJADORES (Para el Select del Modal) ---
export const getTrabajadores = async (): Promise<ApiResponse> => {
    try {
        const response = await fetch(API_URL_USERS); // Reutilizamos la API de Usuarios
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
            // Mapeamos a un tipo simple y aseguramos que el ID es Number
            const trabajadores = data.data.map((u: { id: string | number; name: string; role: string }) => ({ 
                id: Number(u.id), 
                name: u.name,
                puesto: u.role 
            }));
            return { success: true, data: trabajadores, message: 'Trabajadores cargados.' };
        }
        return data as ApiResponse;
    } catch (_error) {
        console.error("Error en getTrabajadores:", _error);
        return { success: false, message: 'Fallo al cargar la lista de trabajadores.' };
    }
};


// --- CREACIÓN (POST) ---
export const createIncidencia = async (incidencia: { id_trabajador: number, asunto: string, descripcion: string }): Promise<ApiResponse> => {
    try {
        const response = await fetch(API_URL_INCIDENCIAS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(incidencia),
        });
        const data = await response.json();
        return data as ApiResponse;
    } catch (error) {
        console.error("Error en createIncidencia:", error);
        return { success: false, message: 'Fallo al crear la incidencia.' };
    }
};


// --- ACTUALIZACIÓN DE ESTADO (PUT) ---
export const updateIncidenciaStatus = async (id_reporte: number, nuevoEstado: ReporteEstado): Promise<ApiResponse> => {
    try {
        const response = await fetch(API_URL_INCIDENCIAS, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_reporte: id_reporte, estado: nuevoEstado }),
        });
        const data = await response.json();
        return data as ApiResponse;
    } catch (error) {
        return { success: false, message: `Fallo al actualizar el estado: ${(error as Error).message}` };
    }
};


// --- ELIMINACIÓN (DELETE) ---
export const deleteIncidencia = async (id_reporte: number): Promise<ApiResponse> => {
    try {
        const response = await fetch(API_URL_INCIDENCIAS, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_reporte: id_reporte }),
        });
        const data = await response.json();
        return data as ApiResponse;
    } catch (error) {
        return { success: false, message: `Fallo al eliminar la incidencia: ${(error as Error).message}` };
    }
};