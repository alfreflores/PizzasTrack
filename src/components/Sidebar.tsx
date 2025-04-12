// src/components/Sidebar.tsx

import { Home, ClipboardList, Warehouse, BarChart2, LogOut } from 'lucide-react'

const Sidebar = () => {
  return (
    <aside className="h-screen p-4 bg-gray-100 text-gray-800 flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-bold mb-6">Pizza Kristal</h2>

        {/* Perfil */}
        <div className="mb-6">
          <img
            src="/user.png"
            alt="Usuario"
            className="w-12 h-12 rounded-full mx-auto mb-2"
          />
          <p className="text-center font-semibold">Juan Robles</p>
          <p className="text-center text-sm text-gray-500">Empleado</p>
        </div>

        {/* Menú */}
        <nav className="space-y-4">
          <a href="#" className="block text-md hover:text-indigo-500 items-center gap-2">
            <Home size={18} /> Inicio
          </a>
          <a href="#" className="block text-md hover:text-indigo-500 items-center gap-2">
            <ClipboardList size={18} /> Pedidos
          </a>
          <a href="#" className="block text-md hover:text-indigo-500 items-center gap-2">
            <Warehouse size={18} /> Almacén
          </a>
          <a href="#" className="block text-md hover:text-indigo-500 items-center gap-2">
            <BarChart2 size={18} /> Reportes
          </a>
        </nav>
      </div>

      <div>
        <button className="text-red-600 hover:underline flex items-center gap-2">
          <LogOut size={18} /> Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

export default Sidebar

