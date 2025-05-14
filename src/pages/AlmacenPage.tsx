// src/pages/AlmacenPage.tsx
import React, { useState } from 'react';

// Placeholder Icon Components (reemplazados por SVG)
// const EditIcon: React.FC = () => <span role="img" aria-label="editar">✏️</span>;
// const DeleteIcon: React.FC = () => <span role="img" aria-label="eliminar">🗑️</span>;

const EditIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path></svg>
);

const DeleteIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
);
const ArrowDownIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5 text-gray-400" }) => ( // Tomado de PedidosPage para consistencia
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
);

// Interfaz para los datos de la tabla de almacén
interface ProductoAlmacen {
  id: number;
  producto: string;
  items: number;
  especificacion: string;
  precio: string;
  estatus: 'verde' | 'rojo' | 'amarillo';
}

const almacenDataInicial: ProductoAlmacen[] = [ // Renombrado para usar como estado inicial
  { id: 1, producto: "Masa de Pizza Clásica", items: 10, especificacion: "Paquete 500g", precio: "$123.00", estatus: "amarillo" }, // Ejemplo de estatus amarillo
  { id: 2, producto: "Salsa de Tomate Especial", items: 34, especificacion: "Lata 1kg", precio: "$123.00", estatus: "verde" }, // Corregido: estatus 'verde' para 34 items
  { id: 3, producto: "Queso Mozzarella Rallado", items: 8, especificacion: "Bolsa 2kg", precio: "$123.00", estatus: "amarillo" }, // Ejemplo de estatus amarillo
  { id: 4, producto: "Pepperoni en Rodajas", items: 3, especificacion: "Paquete 250g", precio: "$123.00", estatus: "rojo" }, // Ejemplo de estatus rojo
  { id: 5, producto: "Cajas de Pizza Medianas", items: 34, especificacion: "Paquete 100 unidades", precio: "$123.00", estatus: "verde" },
];

const AlmacenPage: React.FC = () => {
  const [productosAlmacen, setProductosAlmacen] = useState<ProductoAlmacen[]>(almacenDataInicial);
  const [mostrarFormularioProducto, setMostrarFormularioProducto] = useState(false);
  const [criterioOrden, setCriterioOrden] = useState<string>(''); // Estado para el criterio de ordenamiento
  const [nuevoProducto, setNuevoProducto] = useState<Omit<ProductoAlmacen, 'id'>>({
    producto: '',
    items: 0,
    especificacion: '',
    precio: '',
    estatus: 'verde', // Se calculará automáticamente, pero mantenemos la propiedad
  });

  const handleInputChangeProducto = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNuevoProducto(prev => ({ ...prev, [name]: name === 'items' ? parseInt(value, 10) : value }));
  };

  const calcularEstatusPorItems = (items: number): ProductoAlmacen['estatus'] => {
    if (items <= 5) { // Umbral para rojo (bajo stock)
      return 'rojo';
    } else if (items <= 15) { // Umbral para amarillo (stock medio)
      return 'amarillo';
    } else { // Buen stock
      return 'verde';
    }
  };

  const handleSubmitNuevoProducto = (e: React.FormEvent) => {
    e.preventDefault();
    const nuevoId = productosAlmacen.length > 0 ? Math.max(...productosAlmacen.map(p => p.id)) + 1 : 1;
    const estatusCalculado = calcularEstatusPorItems(nuevoProducto.items);
    const productoConEstatus = { ...nuevoProducto, id: nuevoId, estatus: estatusCalculado };

    setProductosAlmacen(prev => [...prev, productoConEstatus]);
    setMostrarFormularioProducto(false);
    // Reset form, estatus se recalculará si se vuelve a abrir o se puede dejar 'verde' por defecto
    // para el estado inicial del formulario, ya que no se muestra al usuario.
    setNuevoProducto({ producto: '', items: 0, especificacion: '', precio: '', estatus: 'verde' }); 
  };

  const getStatusClass = (status: ProductoAlmacen['estatus']) => {
    switch (status) {
      case 'verde':
        return 'bg-green-500';
      case 'rojo':
        return 'bg-red-500';
      case 'amarillo':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const parsePrecio = (precioStr: string): number => {
    return parseFloat(precioStr.replace('$', ''));
  };

  const ordenValorEstatus = {
    verde: 1,
    amarillo: 2,
    rojo: 3,
  };

  const productosOrdenados = [...productosAlmacen].sort((a, b) => {
    switch (criterioOrden) {
      case 'producto-asc':
        return a.producto.localeCompare(b.producto);
      case 'producto-desc':
        return b.producto.localeCompare(a.producto);
      case 'items-asc':
        return a.items - b.items;
      case 'items-desc':
        return b.items - a.items;
      case 'precio-asc':
        return parsePrecio(a.precio) - parsePrecio(b.precio);
      case 'precio-desc':
        return parsePrecio(b.precio) - parsePrecio(a.precio);
      case 'estatus-asc': // Verde -> Amarillo -> Rojo
        return ordenValorEstatus[a.estatus] - ordenValorEstatus[b.estatus];
      case 'estatus-desc': // Rojo -> Amarillo -> Verde
        return ordenValorEstatus[b.estatus] - ordenValorEstatus[a.estatus];
      default:
        return 0;
    }
  });

  const handleOrdenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCriterioOrden(e.target.value);
  };

  // Opciones para el select de ordenamiento
  const opcionesOrden = [
    { value: '', label: 'Ordenar por...' },
    { value: 'producto-asc', label: 'Producto (A-Z)' },
    { value: 'producto-desc', label: 'Producto (Z-A)' },
    { value: 'items-asc', label: 'Items (Menor a Mayor)' },
    { value: 'items-desc', label: 'Items (Mayor a Menor)' },
    { value: 'precio-asc', label: 'Precio (Bajo a Alto)' },
    { value: 'precio-desc', label: 'Precio (Alto a Bajo)' },
    { value: 'estatus-asc', label: 'Estatus (Verde > Rojo)' }, // Verde primero
    { value: 'estatus-desc', label: 'Estatus (Rojo > Verde)' }, // Rojo primero
  ];

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      {/* Encabezado y controles superiores */}
      <div className="flex flex-wrap justify-between items-center mb-8 pb-4 border-b border-gray-200 gap-4">
        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out flex items-center"
            onClick={() => setMostrarFormularioProducto(true)}
            aria-label="Añadir nuevo producto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Añadir Producto
          </button>
        </div>
        <div className="relative">
          <label htmlFor="ordenAlmacen" className="sr-only">Ordenar por</label>
          <select
            id="ordenAlmacen"
            name="ordenAlmacen"
            className={`
              block w-full md:w-auto pl-3 pr-10 py-2 text-base border-gray-300 
              focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
              sm:text-sm rounded-md appearance-none bg-white shadow-sm
              ${criterioOrden === '' ? 'text-gray-500' : 'text-gray-900'}
            `}
            value={criterioOrden}
            onChange={handleOrdenChange}
            aria-label="Ordenar productos del almacén"
          >
            {opcionesOrden.map(opcion => (
              <option key={opcion.value} value={opcion.value} disabled={opcion.value === '' && criterioOrden !== ''}>
                {opcion.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ArrowDownIcon />
          </div>
        </div>
      </div>

      {/* Modal Formulario Añadir Producto */}
      {mostrarFormularioProducto && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
          <div className="relative mx-auto p-6 border w-full max-w-lg shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-700">Añadir Nuevo Producto al Almacén</h3>
              <button
                onClick={() => setMostrarFormularioProducto(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Cerrar modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form onSubmit={handleSubmitNuevoProducto} className="space-y-4">
              <div>
                <label htmlFor="producto" className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto</label>
                <input type="text" name="producto" id="producto" value={nuevoProducto.producto} onChange={handleInputChangeProducto} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="items" className="block text-sm font-medium text-gray-700 mb-1">Cantidad (Items)</label>
                  <input type="number" name="items" id="items" value={nuevoProducto.items} onChange={handleInputChangeProducto} required min="0" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900" />
                </div>
                <div>
                  <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-1">Precio (Ej: $123.00)</label>
                  <input type="text" name="precio" id="precio" value={nuevoProducto.precio} onChange={handleInputChangeProducto} required placeholder="$0.00" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900" />
                </div>
              </div>
              <div>
                <label htmlFor="especificacion" className="block text-sm font-medium text-gray-700 mb-1">Especificación (Ej: Paquete 500g)</label>
                <input type="text" name="especificacion" id="especificacion" value={nuevoProducto.especificacion} onChange={handleInputChangeProducto} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900" />
              </div>
              {/* El campo de estatus manual se ha eliminado */}
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setMostrarFormularioProducto(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md shadow-sm">Cancelar</button>
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm">Guardar Producto</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabla de Productos */}
      <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                <span className="sr-only">Acciones</span>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Especificación</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estatus</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {productosOrdenados.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100 transition-colors'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-3">
                    <button type="button" className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-100 transition-colors" aria-label={`Editar ${item.producto}`}>
                      <EditIcon className="w-5 h-5" /> {/* Ajusta el tamaño si es necesario */}
                    </button>
                    <button type="button" className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100 transition-colors" aria-label={`Eliminar ${item.producto}`}>
                      <DeleteIcon className="w-5 h-5" /> {/* Ajusta el tamaño si es necesario */}
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.producto}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.items}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.especificacion}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.precio}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`inline-block h-3 w-3 rounded-full ${getStatusClass(item.estatus)}`} aria-hidden="true"></span>
                  <span className="ml-2 capitalize">{item.estatus}</span> {/* Opcional: mostrar texto del estatus */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlmacenPage;