// src/components/Sidebar.tsx
import React from 'react'; // Aunque no se use explícitamente, es buena práctica mantenerlo por claridad o si añades hooks después. Si tu linter lo permite, puedes quitarlo.
import { NavLink } from 'react-router-dom'; // Importar NavLink
import {
  HomeIcon,
  UserIcon,
  ShoppingBagIcon,
  TruckIcon,
  PowerIcon
} from '@heroicons/react/24/outline';

// Interfaz para las props de cada elemento del menú
interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  to?: string; // Ruta a la que enlaza (opcional para logout)
  isLogout?: boolean; // Indica si es el botón de logout
  onClick?: () => void; // Función para el clic (usado en logout)
}

// Componente para cada elemento individual del menú
function SidebarItem({ icon: Icon, label, to, isLogout = false, onClick }: SidebarItemProps) {
  // Clases base reutilizables
  const baseContainerClasses = `flex items-center gap-3 px-4 py-1.5 rounded-lg cursor-pointer transition w-full text-left`;
  const baseIconClasses = `w-5 h-5 flex-shrink-0`;
  const baseLabelClasses = `font-medium`;

  // Renderizado especial para el botón de logout
  if (isLogout) {
    const logoutContainerClasses = `${baseContainerClasses} bg-black text-red-500 hover:bg-gray-800`;
    const logoutIconClasses = `${baseIconClasses} text-red-500`;
    const logoutLabelClasses = `${baseLabelClasses} text-red-500`;
    return (
      <button className={logoutContainerClasses} onClick={onClick}>
        <Icon className={logoutIconClasses} aria-hidden="true" />
        <span className={logoutLabelClasses}>{label}</span>
      </button>
    );
  }

  // Renderizado para elementos de navegación usando NavLink
  // Asegurarse de que 'to' exista para elementos de navegación
  if (!to) {
    console.error("SidebarItem requiere la prop 'to' para elementos de navegación.");
    return null; // Evita renderizar si falta la ruta
  }

  return (
    <NavLink
      to={to}
      end // Importante para que la ruta "/" no se marque como activa para "/usuarios", etc.
      className={({ isActive }) => {
        // Calcula SOLO las clases del contenedor NavLink
        let containerClasses = baseContainerClasses;

        if (isActive) {
          // Estilos cuando el enlace está activo
          containerClasses += ` bg-blue-100 text-black border-l-4 border-blue-500`;
        } else {
          // Estilos cuando el enlace está inactivo
          containerClasses += ` bg-black text-white hover:bg-gray-800`;
        }
        // Devuelve las clases calculadas para el NavLink
        return containerClasses;
      }}
    >
      {/* Función hija para renderizar el contenido interno (icono y texto) */}
      {/* Aquí sí usamos isActive para aplicar clases específicas al icono y al texto */}
      {({ isActive }) => (
        <>
          <Icon
            className={`${baseIconClasses} ${isActive ? 'text-blue-600' : 'text-blue-400'}`}
            aria-hidden="true"
          />
          <span className={`${baseLabelClasses} ${isActive ? 'text-black' : 'text-white'}`}>
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}

// Interfaz para las props del componente Sidebar principal
interface SidebarProps {
  userName: string;
  userRole: string;
  userImageUrl?: string | null; // URL de la imagen del usuario (opcional)
  onLogout: () => void; // Función para manejar el cierre de sesión
}

// Función auxiliar para obtener iniciales del nombre
const getInitials = (name: string): string => {
  if (!name) return '?'; // Retorna '?' si no hay nombre
  const names = name.trim().split(' ');
  if (names.length === 1) {
    // Si solo hay un nombre/palabra, toma las dos primeras letras
    return names[0].substring(0, 2).toUpperCase();
  }
  // Si hay más de un nombre, toma la primera letra del primero y del último
  return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

// Componente principal del Sidebar
export default function Sidebar({ userName, userRole, userImageUrl, onLogout }: SidebarProps) {
  return (
    // Contenedor principal del Sidebar
    <aside className="w-64 h-screen bg-white flex flex-col shadow-lg flex-shrink-0"> {/* Añadido flex-shrink-0 */}

      {/* Sección del Encabezado: Información del Usuario */}
      <div className="flex items-start gap-3 p-4 border-b border-gray-200">
        {/* Contenedor para la Imagen o Iniciales */}
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xl mt-1 overflow-hidden flex-shrink-0 bg-gray-300"> {/* Fondo gris por defecto */}
          {userImageUrl ? (
            // Muestra la imagen si existe la URL
            <img src={userImageUrl} alt={userName} className="w-full h-full object-cover" />
          ) : (
            // Muestra las iniciales si no hay imagen
            <span className="w-full h-full bg-blue-500 flex items-center justify-center select-none"> {/* Fondo azul para iniciales, select-none para evitar selección */}
              {getInitials(userName)}
            </span>
          )}
        </div>
        {/* Contenedor para el Nombre y Rol */}
        <div className="flex flex-col">
          <h1 className="text-lg font-bold text-black leading-tight">{userName}</h1>
          <p className="text-sm text-gray-500 mt-1">{userRole}</p>
        </div>
      </div>

      {/* Sección de Navegación Principal */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto"> {/* Añadido overflow-y-auto si el menú crece */}
        {/* Elementos del menú usando SidebarItem con la prop 'to' */}
        <SidebarItem icon={HomeIcon} label="Inicio" to="/" />
        <SidebarItem icon={UserIcon} label="Usuarios" to="/usuarios" />
        <SidebarItem icon={ShoppingBagIcon} label="Pedidos" to="/pedidos" />
        <SidebarItem icon={TruckIcon} label="Proveedores" to="/proveedores" />
      </nav>

      {/* Sección del Pie: Botón de Cerrar Sesión */}
      <div className="mt-auto p-3 border-t border-gray-200"> {/* Añadido borde superior opcional */}
         {/* Botón de logout usando SidebarItem con 'isLogout' y 'onClick' */}
         <SidebarItem icon={PowerIcon} label="Cerrar sesión" isLogout onClick={onLogout} />
      </div>
    </aside>
  );
}
