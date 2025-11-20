import { getIncidencias } from "./incidenciaService";
import { getTrabajadores } from "./incidenciaService"; // Reutilizamos esta función para contar empleados
//import { getProductos } from "./almacenService"; 
import { getContacts } from "./contactService";
import { getOrders } from "./pedidosService"; // <--- NUEVA IMPORTACIÓN PARA PEDIDOS

import type { LeadContact } from "./contactService"; 
import type { IncidenciaData } from "./incidenciaService"; 
// Asumiendo que existe un tipo OrderData en tu pedidoService
// import type { OrderData } from "./pedidoService"; 

// --- INTERFACES ---
interface DashboardMetrics {
    // CAMBIO: pedidosSolicitadosCount reemplaza a activosCount (de la API de Almacén, pero mantenemos su uso)
    pedidosSolicitadosCount: number; 
    proveedoresCount: number;
    empleadosCount: number;
    ventasTotal: number; 
    reportesPendientes: { id: number, usuario: string, asunto: string, hora: string, status: 'pendiente' | 'respondido' }[]; 
}

interface ApiResponse {
    success: boolean;
    data?: DashboardMetrics;
    message: string;
}

// --- FUNCIÓN PRINCIPAL DE CARGA ---
export const loadDashboardData = async (): Promise<ApiResponse> => {
    try {
        // --- 1. CONTEO DE EMPLEADOS (Usuarios) ---
        const userResult = await getTrabajadores();
        const empleadosCount = (userResult.success && Array.isArray(userResult.data)) ? userResult.data.length : 0;
        
        // --- 2. CONTEO DE PROVEEDORES (Contactos) ---
        const contactResult = await getContacts();
        let proveedoresCount = 0;
        
        if (contactResult.success && Array.isArray(contactResult.data)) {
            const contactos = contactResult.data as LeadContact[];
            // Filtramos solo los contactos cuya categoría es 'proveedor' (Asumiendo 'tipoContacto' del archivo anterior)
            proveedoresCount = contactos.filter(c => c.tipoContacto === 'proveedor').length;
        }

        // --- 3. CONTEO DE PEDIDOS SOLICITADOS ---
        const ordersResult = await getOrders(); // <--- LLAMADA A LA API DE PEDIDOS
        let pedidosSolicitadosCount = 0;
        
        if (ordersResult.success && Array.isArray(ordersResult.data)) {
            // Contar órdenes cuyo estado es 'Solicitado'
            pedidosSolicitadosCount = ordersResult.data.filter(o => o.estado === 'Solicitado').length;
        }

        // --- 4. REPORTES PENDIENTES ---
        const reportesResult = await getIncidencias();
        let reportesPendientes: DashboardMetrics['reportesPendientes'] = []; 
        
        if (reportesResult.success && Array.isArray(reportesResult.data)) {
            const incidencias = reportesResult.data as IncidenciaData[];

            reportesPendientes = incidencias
                .filter(r => r.estado === 'pendiente')
                .map((r) => ({
                    id: r.id_reporte,
                    usuario: `${r.nombre_trabajador} (${r.puesto_trabajador})`, 
                    asunto: r.asunto,
                    hora: new Date(r.fecha_creacion).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true }),
                    status: 'pendiente' 
                }));
        }

        // --- 5. VENTAS (Placeholder) ---
        const ventasTotal = 5987.99; 

        return {
            success: true,
            data: {
                pedidosSolicitadosCount, // <--- CAMBIO EN EL NOMBRE DE LA CLAVE
                proveedoresCount,
                empleadosCount,
                ventasTotal,
                reportesPendientes,
            },
            message: "Métricas cargadas con éxito."
        };

    } catch (error) {
        console.error("Error cargando dashboard:", error);
        return { success: false, message: "Fallo al conectar con uno o más servicios de datos." };
    }
};