// src/services/pizzaService.tsx
import { ProductEstatus } from './almacenService'; 

const API_URL_PIZZAS = 'http://localhost/Pizzatrack/backend/api/pizzas/index.php'; 
const API_URL_ALMACEN = 'http://localhost/Pizzatrack/backend/api/almacen/index.php'; 

// --- INTERFACES ---

// Detalle de ingredientes para una receta (Se mantiene)
export interface RecetaIngrediente {
    id_producto: number;
    producto_nombre: string;
    cantidad_uso: number;
    unidad_medida: string;
}

// Estructura de la Receta que obtenemos del backend (Se mantiene)
export interface RecetaPizza {
    id_receta: number;
    nombre: string;
    tamano: 'Mediana' | 'Grande';
    precio: number;
    ingredientes: RecetaIngrediente[];
}

// Estructura de la Receta para CREACIÓN/ACTUALIZACIÓN (Se mantiene)
export interface RecetaPayload {
    id_receta?: number;
    nombre: string;
    tamano: 'Mediana' | 'Grande';
    precio: number;
    ingredientes: { id_producto: number; cantidad_uso: number }[]; 
}

// Estructura del Item de Venta para enviar al backend (Se mantiene)
export interface VentaItem {
    id_receta: number;
    quantity: number;
    price: number;
}


// --- NUEVAS INTERFACES PARA REPORTE DIARIO ---
export interface DetalleVentaDia {
    total_vendido: number;
    nombre: string;
    tamano: 'Mediana' | 'Grande';
}

export interface ReporteDiarioData {
    totalVentas: number;
    detalle: DetalleVentaDia[];
}
// --- FIN NUEVAS INTERFACES ---

// Estructura de la Respuesta de la API (Se mantiene)
interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message: string;
}

// Stock del almacén simplificado para verificación del frontend (Se mantiene)
export interface StockItem {
    id: number;
    producto: string;
    items: number; 
    especificacion: string;
    estatus: ProductEstatus;
}

// Interfaz para la respuesta cruda del API de Almacén (Se mantiene)
interface RawStockItem {
    id: string | number;
    producto: string;
    items: string | number;
    especificacion: string;
    precio: string; 
    estatus: ProductEstatus;
}


// --- LECTURA (GET) - RECETAS (Se mantiene) ---
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

// --- LECTURA (GET) - REPORTE DIARIO (NUEVO) ---
export const getVentasDiarias = async (): Promise<ApiResponse<ReporteDiarioData>> => {
    try {
        // Llama al API con el parámetro para obtener el reporte diario
        const response = await fetch(`${API_URL_PIZZAS}?action=daily_report`);
        const data = await response.json();
        
        if (data.success) {
            // Aseguramos que el tipo de data.data coincida con ReporteDiarioData
            return { success: true, data: data.data as ReporteDiarioData, message: data.message };
        }
        return data as ApiResponse<ReporteDiarioData>;
    } catch (error) {
        console.error("Error en getVentasDiarias:", error);
        return { success: false, message: 'Fallo al cargar el reporte de ventas del día.' };
    }
};

// --- LECTURA (GET) - STOCK SIMPLIFICADO (Se mantiene) ---
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


// --- VENTA (POST) (Se mantiene) ---
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


// --- CRUD DE RECETAS (Se mantienen) ---

// CREAR RECETA (POST)
export const createReceta = async (receta: RecetaPayload): Promise<ApiResponse<{ id_receta: number }>> => {
    try {
        const response = await fetch(API_URL_PIZZAS, {
            method: 'POST', 
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