// src/components/Navbar.tsx
import React, { useState, useEffect } from 'react';
// Cambiamos la importación del ícono de batería por el de campana
import { BellIcon } from '@heroicons/react/24/outline';

const Navbar: React.FC = () => {
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
      {/* Título a la izquierda */}
      <h2 className="text-xl font-bold text-gray-800">Pizza Kristal</h2>

      {/* Icono de campana y hora a la derecha */}
      <div className="flex items-center gap-3 text-gray-600">
        {/* Usamos el ícono de campana */}
        <button className="relative p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          <span className="sr-only">Ver notificaciones</span> {/* Accesibilidad */}
          <BellIcon className="h-6 w-6" aria-hidden="true" />
          {/* Opcional: Añadir un punto rojo para notificaciones no leídas */}
          {/* <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" /> */}
        </button>
        <span className="font-medium">{currentTime}</span>
      </div>
    </header>
  );
};

export default Navbar;
