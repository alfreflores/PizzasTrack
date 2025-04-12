// src/components/Sidebar.tsx
import { useState } from 'react';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  ArchiveBoxIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const menuItems = [
    { icon: <HomeIcon className="h-6 w-6" />, label: 'Inicio' },
    { icon: <ClipboardDocumentListIcon className="h-6 w-6" />, label: 'Pedidos' },
    { icon: <ArchiveBoxIcon className="h-6 w-6" />, label: 'Almacén' },
    { icon: <ChartBarIcon className="h-6 w-6" />, label: 'Reportes' },
  ];

  return (
    <div className={`flex flex-col h-screen bg-gray-100 transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="flex items-center justify-between p-4">
        {isOpen && <h2 className="text-xl font-bold">Pizza Kristal</h2>}
        <button onClick={toggleSidebar}>
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>
      <nav className="flex-1">
        {menuItems.map((item, index) => (
          <a key={index} href="#" className="flex items-center p-4 hover:bg-gray-200">
            {item.icon}
            {isOpen && <span className="ml-4">{item.label}</span>}
          </a>
        ))}
      </nav>
      <div className="p-4">
        <button className="flex items-center w-full text-red-600 hover:underline">
          <ArrowRightOnRectangleIcon className="h-6 w-6" />
          {isOpen && <span className="ml-4">Cerrar sesión</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
