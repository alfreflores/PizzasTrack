/// src/services/dashboardService.tsx
import { getIncidencias } from "./incidenciaService";
import { getEmpleados } from "./userService"; // Usado para Empleados
import { getContacts } from "./contactService"; // Usado para Proveedores
import { getOrders } from "./pedidosService"; 
import { getVentasDiarias } from "./pizzaService"; 

import type { LeadContact } from "./contactService"; 
import type { IncidenciaData } from "./incidenciaService"; 
import type { OrdenCompraData } from "./pedidosService";
import type { ReporteDiarioData } from "./pizzaService";
import type { EmpleadoData } from "./userService"; // <- Importar EmpleadoData para tipado

// --- INTERFACES ---
export interface DashboardMetrics {
    pedidosSolicitadosCount: number; 
    proveedoresCount: number;
    empleadosCount: number;
    ventasTotal: number; 
    reportesPendientes: { id: number, usuario: string, asunto: string, hora: string, status: 'pendiente' | 'respondido' }[]; 
    ventasDiariasReporte: ReporteDiarioData | null;
}

interface ApiResponse<T = unknown> { // Usamos un genérico para mantener la estructura
    success: boolean;
    data?: T;
    message: string;
}

// --- FUNCIÓN PRINCIPAL DE CARGA ---
export const loadDashboardData = async (): Promise<ApiResponse<DashboardMetrics>> => {
    try {
        // Ejecución concurrente de todas las llamadas a la API
        const [
            userResult, 
            contactResult, 
            ordersResult, 
            reportesResult, 
            ventasResult
        ] = await Promise.all([
            getEmpleados() as Promise<ApiResponse<EmpleadoData[]>>, // Forzamos el tipado para que devuelva ApiResponse<T[]>
            getContacts() as Promise<ApiResponse<LeadContact[]>>,
            getOrders() as Promise<ApiResponse<OrdenCompraData[]>>,
            getIncidencias() as Promise<ApiResponse<IncidenciaData[]>>,
            getVentasDiarias() as Promise<ApiResponse<ReporteDiarioData>>,
        ]);

        
        // --- 1. CONTEO DE EMPLEADOS (Debe ser el array en data) ---
        const empleadosArray = (userResult.success && Array.isArray(userResult.data)) 
            ? userResult.data as EmpleadoData[] : [];
        const empleadosCount = empleadosArray.length;
        
        // --- 2. CONTEO DE PROVEEDORES ---
        let proveedoresCount = 0;
        const contactosArray = (contactResult.success && Array.isArray(contactResult.data)) 
            ? contactResult.data as LeadContact[] : [];
        proveedoresCount = contactosArray.filter(c => c.tipoContacto === 'proveedor').length;


        // --- 3. CONTEO DE PEDIDOS SOLICITADOS ---
        let pedidosSolicitadosCount = 0;
        const ordenesArray = (ordersResult.success && Array.isArray(ordersResult.data))
            ? ordersResult.data as OrdenCompraData[] : [];
        pedidosSolicitadosCount = ordenesArray.filter(o => o.estado === 'Solicitado').length;


        // --- 4. VENTAS TOTALES (Pizzas del día) ---
        let ventasTotal = 0.00;
        let ventasDiariasReporte: ReporteDiarioData | null = null;
        if (ventasResult.success && ventasResult.data) {
             ventasTotal = (ventasResult.data as ReporteDiarioData).totalVentas;
             ventasDiariasReporte = ventasResult.data as ReporteDiarioData;
        }

        // --- 5. REPORTES PENDIENTES ---
        let reportesPendientes: DashboardMetrics['reportesPendientes'] = []; 
        const incidenciasArray = (reportesResult.success && Array.isArray(reportesResult.data))
            ? reportesResult.data as IncidenciaData[] : [];
        
        if (incidenciasArray.length > 0) {
            reportesPendientes = incidenciasArray
                .filter(r => r.estado === 'pendiente')
                .map((r) => ({
                    id: r.id_reporte,
                    usuario: `${r.nombre_trabajador} (${r.puesto_trabajador})`, 
                    asunto: r.asunto,
                    // Aseguramos que la fecha_creacion exista y sea válida antes de intentar formatear
                    hora: r.fecha_creacion ? new Date(r.fecha_creacion).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A',
                    status: 'pendiente' 
                }));
        }

        // Deberíamos obtener: Pedidos: 3, Proveedores: 6, Empleados: 4, Reportes Pendientes: 1 (asumiendo 1 reporte pendiente real en DB)
        
        return {
            success: true,
            data: {
                pedidosSolicitadosCount, 
                proveedoresCount,
                empleadosCount,
                ventasTotal,
                reportesPendientes,
                ventasDiariasReporte: ventasDiariasReporte,
            } as DashboardMetrics,
            message: "Métricas cargadas con éxito."
        };

    } catch (error) {
        console.error("Error cargando dashboard:", error);
        return { success: false, message: "Fallo al conectar con uno o más servicios de datos. Revise el formato JSON de las APIs PHP." };
    }
};