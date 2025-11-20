// src/components/Sidebar.tsx
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ShoppingBagIcon,
  PowerIcon,
  ArchiveBoxIcon,
  ChartBarIcon,
  UserGroupIcon, // Para Contactos
  ChevronDownIcon,
  ChevronRightIcon,
  Cog6ToothIcon, // Para Gestión
  UserCircleIcon, // Para Usuarios (o UserGroupIcon)
  ShoppingCartIcon, // <-- Icono de carrito para ventas
} from '@heroicons/react/24/outline';

// Interfaz SidebarItemProps (sin cambios)
interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  to: string;
  isSubItem?: boolean;
}

// Componente SidebarItem (sin cambios recientes)
function SidebarItem({ icon: Icon, label, to, isSubItem = false }: SidebarItemProps) {
  const baseContainerClasses = `flex items-center gap-3 px-4 py-2 cursor-pointer transition w-full text-left rounded-lg`;
  const baseIconClasses = `w-5 h-5 flex-shrink-0`;
  const baseLabelClasses = `font-medium`;
  const subItemIndentClass = isSubItem ? 'pl-8' : '';

  return (
    <NavLink
      to={to}
      // --- ACTUALIZADO: end solo para '/' y la ruta exacta de Usuarios ---
      // Esto asegura que /usuarios no esté activo cuando /usuarios/contactos lo esté
      end={to === '/' || to === '/usuarios'}
      className={({ isActive }) => {
        let containerClasses = `${baseContainerClasses} ${subItemIndentClass}`;
        if (isActive) {
          // Estilo activo para NavLink (fondo azul claro, borde izquierdo o redondeado)
          containerClasses += ` bg-blue-100 border-blue-500 ${!isSubItem ? 'border-l-4 rounded-r-lg rounded-l-none' : 'rounded-lg'}`;
        } else {
          // Estilo inactivo para NavLink (texto gris, hover gris claro)
          containerClasses += ` text-gray-700 hover:bg-gray-100`;
        }
        return containerClasses;
      }}
    >
      {({ isActive }) => (
        <>
          <Icon
            className={`${baseIconClasses} ${
              // Icono azul oscuro si activo, azul claro si inactivo (o subitem azul medio)
              isActive ? 'text-blue-600' : (isSubItem ? 'text-blue-500' : 'text-blue-400')
            }`}
            aria-hidden="true"
          />
          <span className={`${baseLabelClasses} ${
            // Texto azul oscuro si activo, gris si inactivo
            isActive ? 'text-blue-800' : 'text-gray-700'
          }`}>
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}


// Interfaz SidebarProps (sin cambios)
interface SidebarProps {
  userName: string;
  userRole: string;
  userImageUrl?: string | null;
  onLogout: () => void;
}

// Función getInitials (sin cambios)
const getInitials = (name: string): string => {
  if (!name) return '?';
  const names = name.trim().split(' ');
  if (names.length === 1) {
    return names[0].substring(0, 2).toUpperCase();
  }
  return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

// Componente principal del Sidebar ACTUALIZADO
export default function Sidebar({ userName, userRole, userImageUrl, onLogout }: SidebarProps) {
  const [isGestionOpen, setIsGestionOpen] = useState(false);
  const location = useLocation();
  // isGestionActive determina si estamos en cualquier ruta bajo /usuarios
  const isGestionSectionActive = location.pathname.startsWith('/usuarios');

  useEffect(() => {
    // Si salimos de la sección /usuarios, cerramos el desplegable de Gestión
    if (!isGestionSectionActive) {
      setIsGestionOpen(false);
    }
    // Opcional: Abrir si se navega a /usuarios o /usuarios/contactos y no estaba abierto
    // else if (isGestionSectionActive && !isGestionOpen) {
    //   setIsGestionOpen(true);
    // }
  }, [location.pathname, isGestionSectionActive]); // Dependencias correctas

  // Clases base para el botón desplegable: Fondo siempre blanco
  const dropdownButtonBaseClasses = `flex items-center justify-between gap-3 px-4 py-2 cursor-pointer transition w-full text-left rounded-lg bg-white hover:bg-white`;

  return (
    <aside className="w-64 h-screen bg-white flex flex-col shadow-lg flex-shrink-0">
      {/* Sección del Encabezado (sin cambios) */}
      <div className="flex items-start gap-3 p-4 border-b border-gray-200">
         <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xl mt-1 overflow-hidden flex-shrink-0 bg-gray-300">
          {userImageUrl ? (
            <img src={userImageUrl} alt={userName} className="w-full h-full object-cover" />
          ) : (
            <span className="w-full h-full bg-blue-500 flex items-center justify-center select-none">
              {getInitials(userName)}
            </span>
          )}
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-bold text-gray-800 leading-tight">{userName}</h1>
          <p className="text-sm text-gray-500 mt-1">{userRole}</p>
        </div>
      </div>

      {/* Sección de Navegación Principal ACTUALIZADA */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {/* --- Inicio usa NavLink y se resalta automáticamente --- */}
        <SidebarItem icon={HomeIcon} label="Inicio" to="/" />
        
        {/* --- NUEVO ITEM: Venta Rápida de Pizzas --- */}
        <SidebarItem icon={ShoppingCartIcon} label="Venta de Pizzas" to="/ventas" />

        {/* --- Elemento Desplegable: Gestión --- */}
        <div>
          <button
            // Usa las clases base definidas (fondo siempre blanco)
            className={dropdownButtonBaseClasses}
            onClick={() => setIsGestionOpen(!isGestionOpen)}
            aria-expanded={isGestionOpen}
          >
            <span className="flex items-center gap-3">
              {/* Icono y texto cambian de color según isGestionSectionActive */}
              <Cog6ToothIcon className={`w-5 h-5 flex-shrink-0 ${
                isGestionSectionActive ? 'text-blue-600' : 'text-blue-400'
              }`} />
              <span className={`font-medium ${
                isGestionSectionActive ? 'text-blue-800' : 'text-gray-700'
              }`}>Gestión</span>
            </span>
            {/* Icono de flecha */}
            {isGestionOpen ? (
              <ChevronDownIcon className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRightIcon className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {/* --- Contenido desplegable ACTUALIZADO --- */}
          {isGestionOpen && (
            <div className="mt-1 space-y-1">
              {/* --- Enlace a Usuarios (usa UsuariosPage) --- */}
              <SidebarItem
                icon={UserCircleIcon} // O UserGroupIcon
                label="Usuarios"
                to="/usuarios" // <-- Ruta principal de usuarios
                isSubItem
              />
              {/* --- Enlace a Contactos (sin cambios) --- */}
              <SidebarItem
                icon={UserGroupIcon} // Icono diferente para distinguir
                label="Contactos"
                to="/usuarios/contactos"
                isSubItem
              />
            </div>
          )}
        </div>

        {/* --- Otros Elementos Principales (usan NavLink) --- */}
        <SidebarItem icon={ShoppingBagIcon} label="Pedidos" to="/pedidos" />
        <SidebarItem icon={ArchiveBoxIcon} label="Almacen" to="/almacen" />
        <SidebarItem icon={ChartBarIcon} label="Reportes" to="/reportes" />

      </nav>

      {/* Sección del Pie: Botón de Cerrar Sesión (sin cambios) */}
      <div className="mt-auto p-3 border-t border-gray-200">
         <button
            className="flex items-center gap-3 px-4 py-2 cursor-pointer transition w-full text-left rounded-lg text-red-600 hover:bg-red-50"
            onClick={onLogout}
          >
            <PowerIcon className="w-5 h-5 flex-shrink-0 text-red-600" aria-hidden="true" />
            <span className="font-medium text-red-600">Cerrar sesión</span>
         </button>
      </div>
    </aside>
  );
}