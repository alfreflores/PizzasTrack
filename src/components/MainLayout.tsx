// src/components/MainLayout.tsx
import Sidebar from './Sidebar';
import Navbar from './Navbar';
// Importar Routes, Route, useLocation (Navigate ya no es necesario aquí)
import { Routes, Route, useLocation } from 'react-router-dom';

// --- Importar las páginas ---
import Dashboard from '../pages/Dashboard';         // <-- Re-añadido
import UsuariosPage from '../pages/UsuariosPage.tsx';
import PedidosPage from '../pages/PedidosPage';
import AlmacenPage from '../pages/AlmacenPage';
import ReportesPage from '../pages/ReportesPage.tsx';
import ContactosPage from '../pages/ContactosPage.tsx';

interface MainLayoutProps {
  userName: string;
  userRole: string;
  userImageUrl?: string | null;
  onLogout: () => void;
}

// --- Mapeo de rutas a títulos ACTUALIZADO ---
const pageTitles: { [key: string]: string } = {
  '/': 'Inicio',                     // <-- Re-añadido
  '/pedidos': 'Gestión de Pedidos',
  '/usuarios': 'Gestión de Usuarios',
  '/usuarios/contactos': 'Contactos',
  '/almacen': 'Gestión de Almacén',
  '/reportes': 'Reportes',
};

const MainLayout = ({ userName, userRole, userImageUrl, onLogout }: MainLayoutProps) => {
  const location = useLocation();

  const currentTitle = pageTitles[location.pathname] ||
                       Object.keys(pageTitles).find(key => location.pathname.startsWith(key + '/') && key !== '/') ||
                       'Panel';

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        userName={userName}
        userRole={userRole}
        userImageUrl={userImageUrl}
        onLogout={onLogout}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar title={currentTitle} />
        <main className="flex-1 p-4 overflow-y-auto">
          {/* --- Rutas ACTUALIZADAS --- */}
          <Routes>
            {/* --- Ruta raíz apunta a Dashboard --- */}
            <Route path="/" element={<Dashboard />} />
            {/* <Route path="/" element={<Navigate to="/pedidos" replace />} /> */}{/* <-- Eliminado */}
            <Route path="/pedidos" element={<PedidosPage />} />
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/usuarios/contactos" element={<ContactosPage />} />
            <Route path="/almacen" element={<AlmacenPage />} />
            <Route path="/reportes" element={<ReportesPage />} />
            <Route path="*" element={<div>404 - Página no encontrada</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
