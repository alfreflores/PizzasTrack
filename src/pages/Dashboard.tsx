// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// CORRECCIÓN: Cambiamos 'X' por 'XMarkIcon' para Heroicons.
// Las demás importaciones se mantienen igual:
import { TruckIcon, UserCircleIcon, ShoppingBagIcon, CurrencyDollarIcon, ClockIcon, XMarkIcon } from '@heroicons/react/24/outline'; 
import { getVentasDiarias, ReporteDiarioData, DetalleVentaDia } from '../services/pizzaService'; 

// --- Definiciones de Íconos para Claridad (Usamos Heroicons) ---
const PedidosIcon: React.FC<{ className?: string }> = ({ className = "text-gray-600" }) => (
  <ShoppingBagIcon className={`w-10 h-10 ${className}`} />
);
const ProveedoresIcon: React.FC<{ className?: string }> = ({ className = "text-gray-600" }) => (
  <TruckIcon className={`w-10 h-10 ${className}`} />
);
const EmpleadosIcon: React.FC<{ className?: string }> = ({ className = "text-gray-600" }) => (
  <UserCircleIcon className={`w-10 h-10 ${className}`} />
);
const VentasIcon: React.FC<{ className?: string }> = ({ className = "text-gray-600" }) => (
  <CurrencyDollarIcon className={`w-10 h-10 ${className}`} />
);
const ClockIconSmall: React.FC<{ className?: string }> = ({ className = "text-gray-400" }) => ( 
  <ClockIcon className={`w-4 h-4 ${className}`} />
);
const PizzaIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => ( // Icono de Pizza (para el botón)
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-9-9 9-9 9 9-9 9zM11 19v-4m0-4h4m-4 4h-4"></path>
    </svg>
);


// --- TIPOS DE DATOS ---
interface DashboardData {
  pedidosCount: number;
  proveedoresCount: number;
  empleadosCount: number;
  ventasTotal: number; // Suma total de ventas del día
  loading: boolean;
  ventasDiariasReporte: ReporteDiarioData | null; // Nuevo campo para el reporte detallado
}

// Datos de ejemplo para la sección de reportes en el Dashboard
interface ReporteResumido {
  id: number;
  usuario: string; 
  asunto: string;
  hora: string;
  status: 'respondido' | 'pendiente';
}

const reportesResumidosMock: ReporteResumido[] = [
  { id: 1, usuario: "Alfredo Díaz (Jefe)", asunto: "Baja de Electricidad", hora: "05:38 p.m.", status: 'pendiente' },
  { id: 2, usuario: "Pat Black (Gerente)", asunto: "Falta de Harina (Stock Rojo)", hora: "05:19 p.m.", status: 'pendiente' },
  { id: 3, usuario: "Bruce Fox (Cajero)", asunto: "Reporte de Usuario", hora: "01:45 PM", status: 'respondido' },
];

// --- COMPONENTE InfoCard MEJORADO CON LINK/BUTTON ---
interface InfoCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  to?: string; // Opcional si es un Link
  onClick?: () => void; // Nuevo para manejar el modal
  bgColor?: string; 
  loading: boolean;
}

// Convertimos InfoCard para que pueda ser tanto Link como Button
const InfoCard: React.FC<InfoCardProps> = ({ title, value, icon, to, onClick, loading, bgColor = "bg-white" }) => {
    const content = (
        <div className={`${bgColor} p-6 rounded-lg shadow-lg flex items-center justify-between transition-all duration-300 transform group-hover:scale-[1.02] group-hover:shadow-xl ${to || onClick ? 'cursor-pointer' : ''}`}>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-semibold text-gray-800 mt-1">
                {loading ? 'Cargando...' : value}
            </p>
          </div>
          <div className="flex-shrink-0 text-indigo-500">
            {icon}
          </div>
        </div>
    );
    
    if (to) {
        return (
            <Link to={to} className="block group">
                {content}
            </Link>
        );
    }

    // Si tiene onClick (Ventas), lo hacemos un botón para el modal
    return (
        <button onClick={onClick} className="block group w-full text-left" disabled={loading}>
            {content}
        </button>
    );
};


// --- FUNCIÓN DE FETCH REAL (MOCK DE OTRAS APIS + REAL DE PIZZAS) ---
const fetchDashboardData = async (): Promise<DashboardData> => {
    // 1. Datos que DEBEN venir de tus otras APIs (pedidos, usuarios, contactos)
    // NOTA: Deberás conectar aquí las funciones de tus servicios reales (pedidosService, userService, etc.)
    const mockCounts = {
        pedidosCount: 2, // Reemplazar con llamada a getOrders()
        proveedoresCount: 4, // Reemplazar con llamada a getProveedores()
        empleadosCount: 3, // Reemplazar con llamada a getEmpleados()
    };
    
    // 2. Obtener Reporte Diario de Ventas de Pizzas (NUEVA FUNCIÓN)
    const ventasResult = await getVentasDiarias();
    
    let ventasTotal = 5987.99; // Mantener el mock si la llamada falla, pero usar el resultado
    let ventasDiariasReporte: ReporteDiarioData | null = null;

    if (ventasResult.success && ventasResult.data) {
        ventasTotal = ventasResult.data.totalVentas;
        ventasDiariasReporte = ventasResult.data;
    } else {
        console.error("Error al cargar ventas diarias:", ventasResult.message);
    }

    return {
        ...mockCounts,
        ventasTotal: ventasTotal,
        ventasDiariasReporte: ventasDiariasReporte,
        loading: false,
    };
};


const Dashboard: React.FC = () => {
    const [data, setData] = useState<DashboardData>({
        pedidosCount: 0,
        proveedoresCount: 0,
        empleadosCount: 0,
        ventasTotal: 0.00,
        loading: true,
        ventasDiariasReporte: null,
    });
    const [mostrarDetalleVentas, setMostrarDetalleVentas] = useState(false);
    
    // Simulación de la acción de restablecer
    const handleRestablecerDia = () => {
        // SIMULACIÓN: Muestra un pop-up y luego resetea los datos en el frontend
        if (window.confirm("ADVERTENCIA: ¿Está seguro de SIMULAR el restablecimiento (borrado) de las ventas de PIZZAS del día? Esta acción no es reversible en la demo.")) {
            
            // Aquí iría una llamada a una nueva API: deleteVentasDiarias()
            
            // Simulamos la recarga de datos con total = 0
            setData(prev => ({
                ...prev,
                ventasTotal: 0.00,
                ventasDiariasReporte: { totalVentas: 0.00, detalle: [] },
            }));
            setMostrarDetalleVentas(false);
            alert("Simulación de Restablecimiento exitosa. Venta Total reseteada a $0.00.");
        }
    };

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const fetchedData = await fetchDashboardData();
                setData(fetchedData);
            } catch (error) {
                console.error("Error al cargar datos del Dashboard:", error);
                setData(prev => ({ ...prev, loading: false }));
            }
        };
        loadDashboard();
    }, []);


    return (
        <div className="p-6 md:p-8 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Inicio</h1>
                
                {/* Botón Venta Rápida de Pizzas */}
                <Link to="/ventas">
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out flex items-center">
                        <PizzaIcon className="w-5 h-5 mr-2" />
                        Venta Rápida de Pizzas
                    </button>
                </Link>
            </div>

            {/* Tarjetas Informativas y Botones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <InfoCard
                    title="PEDIDOS SOLICITADOS"
                    value={data.pedidosCount}
                    icon={<PedidosIcon />} 
                    to="/pedidos" 
                    loading={data.loading}
                />
                <InfoCard
                    title="PROVEEDORES"
                    value={data.proveedoresCount}
                    icon={<ProveedoresIcon />}
                    to="/usuarios/contactos" 
                    loading={data.loading}
                />
                <InfoCard
                    title="EMPLEADOS"
                    value={data.empleadosCount}
                    icon={<EmpleadosIcon />}
                    to="/usuarios" 
                    loading={data.loading}
                />
                <InfoCard
                    title="VENTAS (TOTAL)"
                    value={`$${data.ventasTotal.toFixed(2)}`}
                    icon={<VentasIcon />}
                    // Usa onClick para abrir el modal
                    onClick={() => setMostrarDetalleVentas(true)}
                    loading={data.loading}
                />
            </div>

            {/* Sección Destacada: Reportes y/o Pendientes (Mock data) */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Reportes y/o Pendientes ({reportesResumidosMock.filter(r => r.status === 'pendiente').length})</h2>
                {reportesResumidosMock
                    .filter(reporte => reporte.status === 'pendiente')
                    .map((reporte) => (
                        <Link to="/reportes" key={reporte.id} className="block group">
                            <div className="p-3 rounded-md bg-red-100 border border-red-200 mb-3 last:mb-0 text-red-700 hover:bg-red-200 transition-colors cursor-pointer">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className={`text-sm font-semibold text-red-700`}>{reporte.asunto}</p>
                                        <p className="text-xs text-gray-500">{reporte.usuario}</p>
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500">
                                        <ClockIconSmall className="mr-1" />
                                        {reporte.hora}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                }
                {reportesResumidosMock.filter(r => r.status === 'pendiente').length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                        <p>No hay reportes o pendientes urgentes en este momento.</p>
                    </div>
                )}
            </div>

            {/* ======================================= */}
            {/* MODAL DETALLE DE VENTAS DIARIAS */}
            {/* ======================================= */}
            {mostrarDetalleVentas && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
                    <div className="relative mx-auto p-6 border w-full max-w-lg shadow-lg rounded-md bg-white">
                        <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2 flex justify-between items-center">
                            <span>Reporte de Ventas de Pizzas (Día)</span>
                            {/* CORRECCIÓN: Usamos XMarkIcon */}
                            <button onClick={() => setMostrarDetalleVentas(false)} className="text-gray-400 hover:text-gray-600 p-1"><XMarkIcon className="w-5 h-5" /></button>
                        </h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded-md border border-green-200">
                                <span className="font-bold text-lg text-green-700">Total Vendido Hoy:</span>
                                <span className="font-extrabold text-2xl text-green-800">${data.ventasDiariasReporte?.totalVentas.toFixed(2) ?? '0.00'}</span>
                            </div>
                            
                            <h4 className="text-md font-semibold text-gray-700 mt-4">Detalle de Productos Vendidos:</h4>
                            
                            <div className="max-h-60 overflow-y-auto border rounded-md">
                                {data.ventasDiariasReporte?.detalle && data.ventasDiariasReporte.detalle.length > 0 ? (
                                    data.ventasDiariasReporte.detalle.map((item: DetalleVentaDia, index: number) => (
                                        <div key={index} className="flex justify-between items-center p-3 border-b last:border-b-0 bg-white hover:bg-gray-50">
                                            <span className="text-gray-800 font-medium">{item.nombre} ({item.tamano})</span>
                                            <span className="text-indigo-600 font-bold">{item.total_vendido} unidades</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-gray-500">No hay ventas registradas para el día de hoy.</div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between space-x-3 pt-4 border-t mt-6">
                            <button 
                                onClick={handleRestablecerDia}
                                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition-colors"
                            >
                                Restablecer Día (Simular)
                            </button>
                            <button 
                                onClick={() => setMostrarDetalleVentas(false)} 
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md shadow-sm"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;