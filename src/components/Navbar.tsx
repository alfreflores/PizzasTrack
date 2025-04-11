// src/components/Navbar.tsx
import React from 'react';
import '../styles/navbar.css';

const Navbar: React.FC = () => {
  const currentTime = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <header className="navbar">
      <h3>Inicio</h3>
      <div className="nav-right">
        <span>🔔</span>
        <span>{currentTime}</span>
      </div>
    </header>
  );
};

export default Navbar;
