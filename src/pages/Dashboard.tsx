// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TruckIcon, UserCircleIcon, ShoppingBagIcon, CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/outline'; // Usamos íconos de Heroicons

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


// --- TIPOS DE DATOS (Se pueden mover a un archivo de servicio de Dashboard si es necesario) ---
interface DashboardData {
  pedidosCount: number;
  proveedoresCount: number;
  empleadosCount: number;
  ventasTotal: number;
  loading: boolean;
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

// --- COMPONENTE InfoCard MEJORADO CON LINK ---
interface InfoCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  to: string; // Nueva propiedad para la ruta de destino
  bgColor?: string; 
  loading: boolean;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, value, icon, to, loading, bgColor = "bg-white" }) => {
  return (
    <Link to={to} className="block group">
        <div className={`${bgColor} p-6 rounded-lg shadow-lg flex items-center justify-between transition-all duration-300 transform group-hover:scale-[1.02] group-hover:shadow-xl cursor-pointer`}>
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
    </Link>
  );
};


// --- FUNCIÓN DE FETCH SIMULADA (DEBE SER REEMPLAZADA POR TUS SERVICIOS REALES) ---
// NOTA: Para que esto funcione, debes importar las funciones de tus servicios de PHP:
// import { getOrders } from '../services/pedidosService';
// import { getEmpleados } from '../services/userService';
// import { getProveedores } from '../services/contactService';
// import { getVentasTotales } from '../services/pizzaService'; // NECESITAS ESTA FUNCIÓN

const fetchDashboardData = async (): Promise<DashboardData> => {
    // --- MOCK TEMPORAL DE DATOS REALES ---
    // ESTOS VALORES SON LOS QUE SE MUESTRAN EN TU IMAGEN ORIGINAL
    const mockData: DashboardData = {
        pedidosCount: 2, // Se puede obtener de getOrders().data.length
        proveedoresCount: 4, // Se puede obtener de getProveedores().data.length
        empleadosCount: 3, // Se puede obtener de getEmpleados().data.length
        ventasTotal: 5987.99, // Se puede obtener de getVentasTotales()
        loading: false,
    };
    
    // Simulación de carga de 500ms
    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    return mockData;
    // --- FIN MOCK TEMPORAL ---
};


const Dashboard: React.FC = () => {
    const [data, setData] = useState<DashboardData>({
        pedidosCount: 0,
        proveedoresCount: 0,
        empleadosCount: 0,
        ventasTotal: 0.00,
        loading: true,
    });
    
    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const fetchedData = await fetchDashboardData(); // Llama a tu función real
                setData(fetchedData);
            } catch (error) {
                console.error("Error al cargar datos del Dashboard:", error);
                // Opcional: Mostrar un error al usuario
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
                    to="/pedidos" // <-- LINK A PEDIDOS
                    loading={data.loading}
                />
                <InfoCard
                    title="PROVEEDORES"
                    value={data.proveedoresCount}
                    icon={<ProveedoresIcon />}
                    to="/usuarios/contactos" // <-- LINK A CONTACTOS (donde están los proveedores)
                    loading={data.loading}
                />
                <InfoCard
                    title="EMPLEADOS"
                    value={data.empleadosCount}
                    icon={<EmpleadosIcon />}
                    to="/usuarios" // <-- LINK A USUARIOS/EMPLEADOS
                    loading={data.loading}
                />
                <InfoCard
                    title="VENTAS (TOTAL)"
                    value={`$${data.ventasTotal.toFixed(2)}`}
                    icon={<VentasIcon />}
                    to="/reportes" // <-- LINK A REPORTES/VENTAS
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
        </div>
    );
};

export default Dashboard;