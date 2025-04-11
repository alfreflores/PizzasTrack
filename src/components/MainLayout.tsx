// src/components/MainLayout.tsx
import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import '../styles/dashboard.css';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <div className="content-body">{children}</div>
      </div>
    </div>
  );
};

export default MainLayout;
