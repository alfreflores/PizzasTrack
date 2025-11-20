// src/services/pizzaService.tsx
import { ProductEstatus } from './almacenService'; 

const API_URL_PIZZAS = 'http://localhost/Pizzatrack/backend/api/pizzas/index.php'; 
const API_URL_ALMACEN = 'http://localhost/Pizzatrack/backend/api/almacen/index.php'; 

// --- INTERFACES ---

// Detalle de ingredientes para una receta
export interface RecetaIngrediente {
    id_producto: number;
    producto_nombre: string;
    cantidad_uso: number;
    unidad_medida: string;
}

// Estructura de la Receta que obtenemos del backend
export interface RecetaPizza {
    id_receta: number;
    nombre: string;
    tamano: 'Mediana' | 'Grande';
    precio: number;
    ingredientes: RecetaIngrediente[];
}

// Estructura del Item de Venta para enviar al backend
export interface VentaItem {
    id_receta: number;
    quantity: number;
    price: number;
}

// Estructura de la Receta para CREACIÓN/ACTUALIZACIÓN (POST/PUT)
export interface RecetaPayload {
    id_receta?: number;
    nombre: string;
    tamano: 'Mediana' | 'Grande';
    precio: number;
    // Solo necesitamos ID y cantidad de uso para enviar al backend
    ingredientes: { id_producto: number; cantidad_uso: number }[]; 
}

// Estructura de la Respuesta de la API
interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message: string;
}

// Stock del almacén simplificado para verificación del frontend
export interface StockItem {
    id: number;
    producto: string;
    items: number; // Cantidad disponible en stock
    especificacion: string;
    estatus: ProductEstatus;
}

// Interfaz para la respuesta cruda del API de Almacén
interface RawStockItem {
    id: string | number;
    producto: string;
    items: string | number;
    especificacion: string;
    precio: string; 
    estatus: ProductEstatus;
}


// --- LECTURA (GET) - RECETAS ---
export const getRecetas = async (): Promise<ApiResponse<RecetaPizza[]>> => {
    try {
        const response = await fetch(API_URL_PIZZAS);
        const data = await response.json();
        
        if (data.success) {
            return { success: true, data: data.data as RecetaPizza[], message: data.message };
        }
        return data as ApiResponse<RecetaPizza[]>;
    } catch (error) {
        console.error("Error en getRecetas:", error);
        return { success: false, message: 'Fallo al cargar las recetas de pizzas.' };
    }
};

// --- LECTURA (GET) - STOCK SIMPLIFICADO ---
export const getStockForPizzas = async (): Promise<ApiResponse<StockItem[]>> => {
    try {
        const response = await fetch(API_URL_ALMACEN);
        const data = await response.json() as ApiResponse<RawStockItem[]>;
        
        if (data.success && Array.isArray(data.data)) {
            const stockData: StockItem[] = data.data.map((item) => ({
                id: Number(item.id),
                producto: item.producto,
                items: Number(item.items),
                especificacion: item.especificacion, 
                estatus: item.estatus,
            }));
            return { success: true, data: stockData, message: data.message };
        }
        return data as ApiResponse<StockItem[]>;
    } catch (error) {
        console.error("Error en getStockForPizzas:", error);
        return { success: false, message: 'Fallo al cargar el stock del almacén.' };
    }
};


// --- VENTA (POST) ---
export const processPizzaSale = async (items: VentaItem[]): Promise<ApiResponse<{ id_venta: number }>> => {
    try {
        const response = await fetch(API_URL_PIZZAS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items }), 
        });
        
        const data = await response.json();
        
        if (data.success) {
            return { success: true, data: { id_venta: data.id_venta }, message: data.message };
        }
        return data as ApiResponse<{ id_venta: number }>;
    } catch (error) {
        console.error("Error en processPizzaSale:", error);
        return { success: false, message: 'Fallo de conexión al procesar la venta.' };
    }
};


// --- CRUD DE RECETAS ---

// CREAR RECETA (POST)
export const createReceta = async (receta: RecetaPayload): Promise<ApiResponse<{ id_receta: number }>> => {
    try {
        const response = await fetch(API_URL_PIZZAS, {
            method: 'POST', // Reutilizamos POST en la API
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(receta), 
        });
        const data = await response.json();
        if (data.success) {
            return { success: true, data: { id_receta: data.id_receta }, message: data.message };
        }
        return data as ApiResponse<{ id_receta: number }>;
    } catch (error) {
        console.error("Error en createReceta:", error);
        return { success: false, message: 'Fallo al crear la receta.' };
    }
};

// ACTUALIZAR RECETA (PUT)
export const updateReceta = async (receta: RecetaPayload): Promise<ApiResponse> => {
    try {
        const response = await fetch(API_URL_PIZZAS, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(receta), 
        });
        const data = await response.json();
        return data as ApiResponse;
    } catch (error) {
        console.error("Error en updateReceta:", error);
        return { success: false, message: 'Fallo al actualizar la receta.' };
    }
};

// ELIMINAR RECETA (DELETE)
export const deleteReceta = async (id_receta: number): Promise<ApiResponse> => {
    try {
        const response = await fetch(API_URL_PIZZAS, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_receta }), 
        });
        const data = await response.json();
        return data as ApiResponse;
    } catch (error) {
        console.error("Error en deleteReceta:", error);
        return { success: false, message: 'Fallo al eliminar la receta.' };
    }
};