// src/components/Sidebar.tsx
import React from 'react';
import '../styles/sidebar.css';

const Sidebar: React.FC = () => {
  return (
    <div className="sidebar">
      <h2 className="logo">Pizza Kristal</h2>
      <div className="user-info">
        <img src="https://via.placeholder.com/50" alt="User" />
        <span>Juan Robles</span>
        <small>Empleado</small>
      </div>
      <nav className="nav-links">
        <a href="#">Inicio</a>
        <a href="#">Pedidos</a>
        <a href="#">Almacén</a>
        <a href="#">Reportes</a>
      </nav>
      <button className="logout-btn">Cerrar sesión</button>
    </div>
  );
};

export default Sidebar;
