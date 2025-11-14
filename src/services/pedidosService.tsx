// Asegúrate de importar estas interfaces de sus respectivos archivos de servicio
import { LeadContact } from './contactService'; 
import { ProductoAlmacenData } from './almacenService'; 

const API_URL_PEDIDOS = 'http://localhost/Pizzatrack/backend/api/pedidos/index.php'; 
const API_URL_CONTACTOS = 'http://localhost/Pizzatrack/backend/api/contacts/index.php'; 
const API_URL_ALMACEN = 'http://localhost/Pizzatrack/backend/api/almacen/index.php'; 

// --- INTERFACES DE PEDIDOS ---
export type PedidoEstado = 'Solicitado' | 'Confirmado' | 'Enviado' | 'Recibido Completo' | 'Cancelado' | 'Pendiente de Pago';

export interface OrdenCompraData {
    id: string | number; 
    id_pedido?: number; // ID numérico para PUT/DELETE
    id_proveedor: number;
    id_producto: number;
    fecha: string; 
    cantidad: number;
    total: number;
    estado: PedidoEstado;
    notas_adicionales: string;
    
    // Campos de JOIN para el frontend
    proveedor_nombre?: string;
    producto_nombre?: string;
}

// --- INTERFAZ DE RESPUESTA ---
interface ApiResponse {
    success: boolean;
    data?: unknown; 
    message: string;
}

// --- FUNCIÓN DE LECTURA (GET) DE ÓRDENES ---
export const getOrders = async (): Promise<ApiResponse> => {
    try {
        const response = await fetch(API_URL_PEDIDOS);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();
        return data as ApiResponse;
    } catch (error) {
        console.error("Error en getOrders:", error);
        return { success: false, message: 'Fallo al cargar las órdenes de compra.' };
    }
};

// --- FUNCIÓN DE OBTENER PROVEEDORES (CORREGIDO) ---
export const getProveedores = async (): Promise<ApiResponse> => {
    try {
        const response = await fetch(API_URL_CONTACTOS);
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
            const proveedores = data.data
                .filter((c: LeadContact) => c.tipoContacto === 'proveedor')
                .map((c: LeadContact) => ({ 
                    id: String(c.id), // <-- CONVERTIMOS A STRING PARA CONSISTENCIA EN EL SELECT
                    name: c.name 
                })); 
            
            return { success: true, data: proveedores, message: 'Proveedores cargados.' };
        }
        return data as ApiResponse;
    } catch (error) {
        console.error("Error en getProveedores:", error);
        return { success: false, message: 'Fallo al cargar la lista de proveedores.' };
    }
};

// --- FUNCIÓN DE OBTENER PRODUCTOS (CORREGIDO) ---
export const getProductosAlmacen = async (): Promise<ApiResponse> => {
    try {
        const response = await fetch(API_URL_ALMACEN);
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
            const productos = data.data.map((p: ProductoAlmacenData) => ({
                id: String(p.id), // <-- CONVERTIMOS A STRING PARA CONSISTENCIA EN EL SELECT
                producto: p.producto,
                precio: p.precio,
                especificacion: p.especificacion
            }));
            return { success: true, data: productos, message: 'Productos cargados.' };
        }
        return data as ApiResponse;
    } catch (error) {
        console.error("Error en getProductosAlmacen:", error);
        return { success: false, message: 'Fallo al cargar la lista de productos de almacén.' };
    }
};

// --- CREACIÓN (POST) ---
export const createOrder = async (order: Omit<OrdenCompraData, 'id' | 'estado' | 'proveedor_nombre' | 'producto_nombre'>): Promise<ApiResponse> => {
    try {
        const response = await fetch(API_URL_PEDIDOS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order),
        });
        const data = await response.json();
        return data as ApiResponse;
    } catch (error) {
        console.error("Error en createOrder:", error);
        return { success: false, message: 'Fallo al generar la orden de compra.' };
    }
};


// --- ACTUALIZACIÓN DE ESTADO (PUT) ---
export const updateOrderStatus = async (id: number, nuevoEstado: PedidoEstado): Promise<ApiResponse> => {
    try {
        const response = await fetch(API_URL_PEDIDOS, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, estado: nuevoEstado }),
        });
        const data = await response.json();
        return data as ApiResponse;
    } catch (error) {
        console.error("Error en updateOrderStatus:", error);
        return { success: false, message: 'Fallo al actualizar el estado de la orden.' };
    }
};


// --- ELIMINACIÓN (DELETE) ---
export const deleteOrder = async (id: number): Promise<ApiResponse> => {
    try {
        const response = await fetch(API_URL_PEDIDOS, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id }),
        });
        const data = await response.json();
        return data as ApiResponse;
    } catch (error) {
        console.error("Error en deleteOrder:", error);
        return { success: false, message: 'Fallo al eliminar la orden.' };
    }
};