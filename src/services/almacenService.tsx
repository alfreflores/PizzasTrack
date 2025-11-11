const API_URL_ALMACEN = 'http://localhost/Pizzatrack/backend/api/almacen/index.php'; 

// Tipos base para los datos de la BD
export type ProductEstatus = 'verde' | 'rojo' | 'amarillo';

export interface ProductoAlmacenData {
    id?: number; 
    producto: string;
    items: number;
    especificacion: string;
    precio: string; // Se maneja como string para formato de moneda
    estatus?: ProductEstatus; // Se calcula en el backend/frontend
}

interface ApiResponse {
    success: boolean;
    data?: ProductoAlmacenData[];
    message: string;
}

// --- CRUD FUNCTIONS ---

export const getProductos = async (): Promise<ApiResponse> => {
    try {
        const response = await fetch(API_URL_ALMACEN);
        const data = await response.json();
        return data as ApiResponse;
    } catch (error) { // <--- Aquí es donde se define 'error'
        console.error("Error en getProductos:", error); // <-- ¡Ahora lo estamos usando!
        return { success: false, message: 'Fallo de conexión con el servidor (Almacén).' };
    }
};

export const createProducto = async (producto: Omit<ProductoAlmacenData, 'id' | 'estatus'>): Promise<ApiResponse> => {
    try {
        const response = await fetch(API_URL_ALMACEN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(producto),
        });
        const data = await response.json();
        return data as ApiResponse;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return { success: false, message: 'Fallo de conexión durante la creación.' };
    }
};

export const updateProducto = async (producto: ProductoAlmacenData & { id: number }): Promise<ApiResponse> => {
    try {
        const response = await fetch(API_URL_ALMACEN, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(producto),
        });
        const data = await response.json();
        return data as ApiResponse;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return { success: false, message: 'Fallo de conexión durante la actualización.' };
    }
};

export const deleteProducto = async (id: number): Promise<ApiResponse> => {
    try {
        const response = await fetch(API_URL_ALMACEN, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id }),
        });
        const data = await response.json();
        return data as ApiResponse;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return { success: false, message: 'Fallo de conexión durante la eliminación.' };
    }
};