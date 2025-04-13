// src/components/MainLayout.tsx
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Routes, Route } from 'react-router-dom'; // <-- Importar Routes y Route

// --- Importar las páginas ---
import Dashboard from '../pages/Dashboard';
import UsuariosPage from '../pages/UsuariosPage';
import PedidosPage from '../pages/PedidosPage';
import ProveedoresPage from '../pages/ProveedoresPage';

// --- Modificar MainLayoutProps (quitar children) ---
interface MainLayoutProps {
  // children: React.ReactNode; // <-- Ya no se necesita
  userName: string;
  userRole: string;
  userImageUrl?: string | null;
  onLogout: () => void;
}

// --- Modificar el componente ---
const MainLayout = ({ userName, userRole, userImageUrl, onLogout }: MainLayoutProps) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        userName={userName}
        userRole={userRole}
        userImageUrl={userImageUrl}
        onLogout={onLogout}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        {/* --- Área principal ahora define las rutas --- */}
        <main className="flex-1 p-4 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/pedidos" element={<PedidosPage />} />
            <Route path="/proveedores" element={<ProveedoresPage />} />
            {/* Opcional: Ruta para páginas no encontradas */}
            <Route path="*" element={<div>404 - Página no encontrada</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
