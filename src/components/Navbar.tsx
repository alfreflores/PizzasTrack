// src/components/Navbar.tsx
import React, { useState, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';

// --- Añadir interfaz para las props ---
interface NavbarProps {
  title: string; // Prop para recibir el título dinámico
}

// --- Modificar la firma del componente para aceptar props ---
const Navbar: React.FC<NavbarProps> = ({ title }) => { // Desestructurar title de las props
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const time = new Date().toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      setCurrentTime(time);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="w-full h-16 flex items-center justify-between px-4 bg-white shadow-md z-10">
      {/* --- Usar el título recibido por props --- */}
      <h2 className="text-xl font-bold text-gray-800">{title}</h2>

      {/* Icono de campana y hora a la derecha (sin cambios) */}
      <div className="flex items-center gap-3 text-gray-600">
        <button className="relative p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          <span className="sr-only">Ver notificaciones</span>
          <BellIcon className="h-6 w-6" aria-hidden="true" />
        </button>
        <span className="font-medium">{currentTime}</span>
      </div>
    </header>
  );
};

export default Navbar;
