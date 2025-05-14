// src/pages/Dashboard.tsx
import React from 'react';

// Placeholder Icon Components (reemplazar con una biblioteca de íconos si se desea)
const BriefcaseIcon: React.FC<{ className?: string }> = ({ className = "text-gray-600" }) => ( // Para Activos
  <svg className={`w-10 h-10 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
  </svg>
);

const TruckIcon: React.FC<{ className?: string }> = ({ className = "text-gray-600" }) => ( // Para Proveedores
  <svg 
    className={`w-10 h-10 ${className}`} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <rect x="1" y="3" width="15" height="13"></rect>
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
    <circle cx="5.5" cy="18.5" r="2.5"></circle>
    <circle cx="18.5" cy="18.5" r="2.5"></circle>
  </svg>
);

const UserSilhouetteIcon: React.FC<{ className?: string }> = ({ className = "text-gray-600" }) => ( // Para Empleados (silueta individual)
  <svg className={`w-10 h-10 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
  </svg>
);

const MoneyIcon: React.FC<{ className?: string }> = ({ className = "text-gray-600" }) => (
  <svg className={`w-10 h-10 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
  </svg>
);

const ClockIconSmall: React.FC<{ className?: string }> = ({ className = "text-gray-400" }) => ( // Icono de reloj más pequeño para el dashboard
  <svg className={`w-4 h-4 ${className}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
  </svg>
);

interface InfoCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor?: string; // Opcional para diferentes colores de fondo de tarjeta
}

const InfoCard: React.FC<InfoCardProps> = ({ title, value, icon, bgColor = "bg-white" }) => {
  return (
    <div className={`${bgColor} p-6 rounded-lg shadow-lg flex items-center justify-between`}>
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-semibold text-gray-800 mt-1">{value}</p>
      </div>
      <div className="flex-shrink-0">
        {icon}
      </div>
    </div>
  );
};

// Datos de ejemplo para la sección de reportes en el Dashboard
interface ReporteResumido {
  id: number;
  usuario: string; // Combinación de puesto y nombre para resumir
  asunto: string;
  hora: string;
  status: 'respondido' | 'pendiente';
}

const reportesResumidosData: ReporteResumido[] = [
  { id: 1, usuario: "Angel Jones (Cocinero)", asunto: "Consulta de Contacto", hora: "11:15 AM", status: 'pendiente' },
  { id: 2, usuario: "Bruce Fox (Cajero)", asunto: "Reporte de Usuario", hora: "01:45 PM", status: 'pendiente' },
  { id: 3, usuario: "Pat Black (Gerente)", asunto: "Pedido Nuevo", hora: "10:30 AM", status: 'respondido' },
];

const Dashboard: React.FC = () => {
  const numeroDeEmpleados = 5;
  // Datos de ejemplo para otras tarjetas (podrían venir de un estado o API)
  const activosCount = 2;
  const proveedoresCount = 5;
  const ventasTotal = 5987.99;

  const getStatusColorClass = (status: ReporteResumido['status']) => {
    if (status === 'pendiente') return 'text-red-500'; // Pendientes en rojo para destacar
    if (status === 'respondido') return 'text-green-500';
    return 'text-gray-500';
  };


  return (
    <div className="p-6 md:p-8 bg-gray-100 min-h-screen">

      {/* Tarjetas Informativas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <InfoCard
          title="Activos"
          value={activosCount}
          icon={<BriefcaseIcon />}
        />
        <InfoCard
          title="Proveedores"
          value={proveedoresCount}
          icon={<TruckIcon />}
        />
        <InfoCard
          title="Empleados"
          value={numeroDeEmpleados}
          icon={<UserSilhouetteIcon />}
        />
        <InfoCard
          title="Ventas"
          value={`$${ventasTotal.toFixed(2)}`}
          icon={<MoneyIcon />}
        />
      </div>

      {/* Sección Destacada: Reportes y/o Pendientes */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Reportes y/o Pendientes</h2>
        {reportesResumidosData.filter(reporte => reporte.status === 'pendiente').length > 0 ? (
          <ul className="space-y-3">
            {reportesResumidosData
              .filter(reporte => reporte.status === 'pendiente') // Filtrar solo los pendientes
              .slice(0, 3) // Mostrar solo los primeros 3 pendientes, por ejemplo
              .map((reporte) => (
              <li key={reporte.id} className="p-3 rounded-md bg-orange-50 border border-orange-200"> {/* Estilo fijo para pendientes */}
                <div className="flex justify-between items-center">
                  <div>
                    <p className={`text-sm font-semibold ${getStatusColorClass(reporte.status)}`}>{reporte.asunto}</p>
                    <p className="text-xs text-gray-500">{reporte.usuario}</p>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <ClockIconSmall className="mr-1" />
                    {reporte.hora}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>No hay reportes o pendientes urgentes en este momento.</p>
          </div>
        )}
      </div>

      {/* Otras secciones que podrías considerar (ejemplos) */}
      {/* 
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Pedidos Recientes</h3>
          {/* Componente de lista de pedidos recientes aquí *}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Actividad de Usuarios</h3>
          {/* Componente de actividad de usuarios aquí *}
        </div>
      </div>
      */}
    </div>
  );
};

export default Dashboard;
