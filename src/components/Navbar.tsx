// src/components/Navbar.tsx
import React from 'react';
import '../styles/navbar.css';

const Navbar: React.FC = () => {
  const currentTime = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <header className="w-full h-16 flex items-center justify-between px-4 bg-white shadow">
      <h3>Inicio</h3>
      <div className="flex items-center gap-4">
        <span>🔔</span>
        <span>{currentTime}</span>
      </div>
    </header>
  );
};

export default Navbar;