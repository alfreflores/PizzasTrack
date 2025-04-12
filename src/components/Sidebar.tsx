// src/components/Sidebar.tsx
import { useState } from 'react';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon, // Ícono para Clientes
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);

  // Definición de los ítems del menú actualizados
  const menuItems = [
    { icon: <HomeIcon className="h-6 w-6 text-blue-600" />, label: 'Inicio' },
    { icon: <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />, label: 'Pedidos' },
    { icon: <UserGroupIcon className="h-6 w-6 text-blue-600" />, label: 'Clientes' }, // Nuevo ítem
    { icon: <ChartBarIcon className="h-6 w-6 text-blue-600" />, label: 'Reportes' },
  ];

  return (
    // Sidebar principal: fondo blanco, borde morado, transición
<div className={`flex flex-col h-screen bg-white border-r-2 border-transparent shadow-lg transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>

      {/* Sección Superior: Perfil y Botón de Toggle */}
      <div className={`p-4 flex items-center border-b border-gray-200 h-16 ${isOpen ? 'justify-between' : 'justify-center'}`}>
        {/* Información del perfil (visible solo cuando está abierto) */}
        {isOpen && (
          <div className="flex items-center">
            {/* Placeholder para foto de perfil */}
            <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold mr-2">
              JR {/* Iniciales o ícono */}
            </div>
            <span className="font-semibold text-gray-700">Juan Robles</span>
          </div>
        )}

        {/* Botón para colapsar/expandir */}
        <button onClick={toggleSidebar} className="p-1 rounded hover:bg-gray-200 text-gray-600">
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>

      {/* Navegación Principal (ocupa el espacio restante) */}
      <nav className="flex-1 py-4">
        {menuItems.map((item, index) => (
          <a
            key={index}
            href="#" // Cambia esto por tus rutas reales (e.g., usando react-router-dom Link)
            className="flex items-center p-3 mx-2 my-1 rounded-md text-gray-700 hover:bg-purple-100 hover:text-purple-800 transition-colors duration-150"
            title={!isOpen ? item.label : undefined} // Tooltip cuando está cerrado
          >
            {item.icon}
            {isOpen && <span className="ml-3 font-medium">{item.label}</span>}
          </a>
        ))}
      </nav>

      {/* Sección Inferior: Cerrar Sesión */}
      <div className="p-2 border-t border-gray-200">
        <button
          className="flex items-center w-full p-3 mx-2 my-1 rounded-md text-gray-700 hover:bg-red-100 hover:text-red-700 transition-colors duration-150"
          title={!isOpen ? "Cerrar sesión" : undefined} // Tooltip cuando está cerrado
        >
          <ArrowRightOnRectangleIcon className="h-6 w-6 text-red-500" />
          {isOpen && <span className="ml-3 font-medium">Cerrar sesión</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
