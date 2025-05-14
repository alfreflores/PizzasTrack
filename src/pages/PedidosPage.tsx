// src/pages/PedidosPage.tsx
import React from 'react';

// --- Icon Components ---
const CalendarIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5 text-gray-400" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path></svg>
);
const ArrowDownIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5 text-gray-400" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
);
const EditIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path></svg>
);
const DeleteIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
);
const ViewIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path></svg>
);
const StatusUpdateIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => ( // Icono de ejemplo para cambiar estado
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
);

// Interfaz para los datos de la tabla de seguimiento
interface OrdenCompra {
  id: string;
  proveedor: string;
  fecha: string;
  // productos: string; // Reemplazado por producto y cantidad
  producto: string; // Nombre del ítem específico
  cantidad: number;
  total: number;
  estado: 'Solicitado' | 'Confirmado' | 'Enviado' | 'Recibido Parcialmente' | 'Recibido Completo' | 'Cancelado' | 'Pendiente de Pago';
}

// Productos de ejemplo para el select (podrían venir de AlmacenPage o una fuente de datos común)
const productosDisponibles = [
  "Masa de Pizza Clásica",
  "Salsa de Tomate Especial",
  "Queso Mozzarella Rallado",
  "Pepperoni en Rodajas",
  "Cajas de Pizza Medianas",
  "Harina de trigo",
  "Levadura",
  "Tomates",
  "Champiñones",
];

const ordenesCompraData: OrdenCompra[] = [
  { id: "OC-001", proveedor: "Harinas del Sol S.A.", fecha: "2024-03-08", producto: "Harina de trigo", cantidad: 2, total: 1250.00, estado: "Recibido Completo" },
  { id: "OC-002", proveedor: "Quesos La Vaquita Feliz", fecha: "2024-03-09", producto: "Queso Mozzarella Rallado", cantidad: 5, total: 2300.50, estado: "Enviado" },
  { id: "OC-003", proveedor: "Vegetales Frescos del Campo", fecha: "2024-03-10", producto: "Tomates", cantidad: 10, total: 850.00, estado: "Confirmado" },
  { id: "OC-004", proveedor: "Empaques Modernos", fecha: "2024-03-11", producto: "Cajas de Pizza Medianas", cantidad: 100, total: 600.00, estado: "Solicitado" },
  { id: "OC-005", proveedor: "Bebidas Refrescantes Co.", fecha: "2024-03-07", producto: "Coca-Cola", cantidad: 24, total: 750.00, estado: "Cancelado" },
  { id: "OC-006", proveedor: "Carnes Selectas S.R.L.", fecha: "2024-03-11", producto: "Pepperoni en Rodajas", cantidad: 3, total: 1800.00, estado: "Pendiente de Pago" },
];

const PedidosPage: React.FC = () => {
  const getStatusClass = (status: OrdenCompra['estado']) => {
    switch (status) {
      case 'Solicitado': return 'bg-blue-100 text-blue-800';
      case 'Confirmado': return 'bg-indigo-100 text-indigo-800';
      case 'Enviado': return 'bg-cyan-100 text-cyan-800';
      case 'Recibido Parcialmente': return 'bg-yellow-100 text-yellow-800';
      case 'Recibido Completo': return 'bg-green-100 text-green-800';
      case 'Pendiente de Pago': return 'bg-orange-100 text-orange-800';
      case 'Cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    // El div principal de la página comienza aquí
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      {/* Sección Generar Orden de Compra */}
      <div className="mb-10">
        <div className="flex justify-between items-center bg-gray-100 px-4 py-3 rounded-t-md shadow-sm w-full">
          <h2 className="text-2xl font-semibold text-gray-800">
            Generar Orden de Compra
          </h2>
          <button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out"
          >
            Limpiar Formulario
          </button>
        </div>
        <div className="bg-white p-6 rounded-b-md shadow-lg"> {/* Quitamos flex y gap de aquí */}
          <form className="flex flex-wrap items-start gap-x-6 gap-y-4">
            {/* Proveedor */}
            <div className="flex-grow basis-0 min-w-[280px]">
              <div className="flex items-center">
                <label htmlFor="proveedor" className="text-sm font-medium text-gray-700 mr-3 whitespace-nowrap">Proveedor</label>
                <div className="relative flex-grow">
                  <select
                    id="proveedor"
                    name="proveedor"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md appearance-none bg-gray-100 text-gray-900"
                  >
                    <option value="">Seleccionar Proveedor...</option>
                    <option value="Harinas del Sol S.A.">Harinas del Sol S.A.</option>
                    <option value="Quesos La Vaquita Feliz">Quesos La Vaquita Feliz</option>
                    <option value="Vegetales Frescos del Campo">Vegetales Frescos del Campo</option>
                    <option value="Empaques Modernos">Empaques Modernos</option>
                    <option value="Bebidas Refrescantes Co.">Bebidas Refrescantes Co.</option>
                    <option value="Carnes Selectas S.R.L.">Carnes Selectas S.R.L.</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                    <ArrowDownIcon />
                  </div>
                </div>
              </div>
            </div>

            {/* Fecha de Orden */}
            <div className="flex-grow basis-0 min-w-[280px]">
              <div className="flex items-center">
                <label htmlFor="fechaOrden" className="text-sm font-medium text-gray-700 mr-3 whitespace-nowrap">Fecha de Orden</label>
                <div className="relative flex-grow">
                  <input
                    type="date"
                    id="fechaOrden"
                    name="fechaOrden"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100 text-gray-900"
                  />
                  <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                    <CalendarIcon />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Producto */}
            <div className="flex-grow basis-0 min-w-[280px]">
              <div className="flex items-center">
                <label htmlFor="producto" className="text-sm font-medium text-gray-700 mr-3 whitespace-nowrap">Producto</label>
                <div className="relative flex-grow">
                  <select
                    id="producto"
                    name="producto"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md appearance-none bg-gray-100 text-gray-900"
                  >
                    <option value="">Seleccionar Producto...</option>
                    {productosDisponibles.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                    <ArrowDownIcon />
                  </div>
                </div>
              </div>
            </div>

            {/* Total Estimado */}
            <div className="flex-grow basis-0 min-w-[280px]">
              <div className="flex items-center">
                <label htmlFor="totalEstimado" className="text-sm font-medium text-gray-700 mr-3 whitespace-nowrap">Total Estimado</label>
                <div className="relative flex-grow">
                  <input
                    type="number"
                    id="totalEstimado"
                    name="totalEstimado"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100 text-gray-900"
                    placeholder="0.00" 
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* Cantidad */}
            <div className="flex-grow basis-0 min-w-[280px]">
              <div className="flex items-center">
                <label htmlFor="cantidad" className="text-sm font-medium text-gray-700 mr-3 whitespace-nowrap">Cantidad</label>
                <div className="relative flex-grow">
                  <input
                    type="number"
                    id="cantidad"
                    name="cantidad"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100 text-gray-900"
                    placeholder="0"
                    min="1"
                  />
                </div>
              </div>
            </div>
            
            {/* Notas Adicionales */}
            <div className="flex-grow basis-full"> {/* basis-full para que ocupe todo el ancho disponible en su fila */}
              <div className="flex items-start"> {/* items-start para alinear la etiqueta con la parte superior del textarea */}
                <label htmlFor="notasAdicionales" className="text-sm font-medium text-gray-700 mr-3 whitespace-nowrap pt-2">Notas Adicionales</label>
                <div className="relative flex-grow">
                  <textarea
                    id="notasAdicionales"
                    name="notasAdicionales"
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100 placeholder-gray-400 text-gray-900"
                    placeholder="Instrucciones especiales, referencias, etc." 
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Botón Generar Orden */}
            <div className="w-full flex justify-end mt-4">
              <button
                type="submit" // Cambiado a submit para el formulario
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-md shadow-md transition duration-150 ease-in-out"
              >
                Generar Orden
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Sección Listado de Órdenes de Compra */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 bg-gray-100 px-4 py-3 rounded-t-md shadow-sm w-full">
          Listado de Órdenes de Compra
        </h2>
        <div className="bg-white shadow-xl rounded-b-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Orden</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th scope="col" className="relative px-6 py-3 w-40"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ordenesCompraData.map((orden, index) => (
                <tr key={orden.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100 transition-colors'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{orden.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{orden.proveedor}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{orden.fecha}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">{orden.producto}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{orden.cantidad}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${orden.total.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(orden.estado)}`}>
                      {orden.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button title="Ver Detalles" className="text-gray-400 hover:text-blue-600 p-1 rounded-full hover:bg-blue-100 transition-colors">
                        <ViewIcon />
                      </button>
                      <button title="Editar Pedido" className="text-gray-400 hover:text-indigo-600 p-1 rounded-full hover:bg-indigo-100 transition-colors">
                        <EditIcon />
                      </button>
                      <button title="Cambiar Estado" className="text-gray-400 hover:text-green-600 p-1 rounded-full hover:bg-green-100 transition-colors">
                        <StatusUpdateIcon />
                      </button>
                      <button title="Eliminar Pedido" className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-red-100 transition-colors">
                        <DeleteIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PedidosPage;
