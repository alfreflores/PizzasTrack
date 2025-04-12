// src/components/MainLayout.tsx

import Sidebar from './Sidebar';
import Navbar from './Navbar';

interface Props {
  children: React.ReactNode;
}

const MainLayout = ({ children }: Props) => {
  return (
    <div className="flex h-screen bg-gray-100"> {/* Fondo gris claro general */}
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden"> {/* Evita doble scrollbar */}
        <Navbar />
        {/* Área principal con padding y scroll si es necesario */}
        <main className="flex-1 p-4 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
