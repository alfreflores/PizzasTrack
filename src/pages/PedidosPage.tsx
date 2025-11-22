import React, { useState, useEffect } from 'react';
// Importamos funciones y tipos de Pedidos (Asegúrate de que updateOrder exista en pedidosService.ts)
import { getOrders, createOrder, deleteOrder, updateOrderStatus, getProveedores, getProductosAlmacen, OrdenCompraData, PedidoEstado } from '../services/pedidosService';
// Importamos INTERFACES como tipo (necesario para el tipado correcto)
import type { LeadContact } from '../services/contactService'; 
import type { ProductoAlmacenData } from '../services/almacenService'; 
import { updateOrder } from '../services/pedidosService'; 


// --- Icon Components ---
const CalendarIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5 text-gray-400" }) => (
 <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path></svg>
);
const ArrowDownIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5 text-gray-400" }) => (
 <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
);
const EditIcon: React.FC<{ className?: string, onClick?: () => void }> = ({ className = "w-5 h-5", onClick }) => (
 <svg onClick={onClick} className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path></svg>
);
const DeleteIcon: React.FC<{ className?: string, onClick?: () => void }> = ({ className = "w-5 h-5", onClick }) => (
 <svg onClick={onClick} className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
);
const ViewIcon: React.FC<{ className?: string, onClick?: () => void }> = ({ className = "w-5 h-5", onClick }) => (
  <svg onClick={onClick} className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path></svg>
);
const StatusUpdateIcon: React.FC<{ className?: string, onClick?: () => void }> = ({ className = "w-5 h-5", onClick }) => ( // Icono de ejemplo para cambiar estado
  <svg onClick={onClick} className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
);

// --- TIPOS SIMPLES LOCALES PARA LOS SELECTS ---
type SimpleContacto = { id: number, name: string };
type SimpleProducto = { id: number, producto: string, precio: string, especificacion: string };


// Interfaz para el estado del formulario de creación
interface PedidoFormState {
  id_proveedor: string | number;
  id_producto: string | number;
  fecha: string; 
  cantidad: number;
  total: number;
  notasAdicionales: string;
}


const PedidosPage: React.FC = () => {
  const [orders, setOrders] = useState<OrdenCompraData[]>([]);
  const [proveedores, setProveedores] = useState<SimpleContacto[]>([]);
  const [productos, setProductos] = useState<SimpleProducto[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [ordenAEditar, setOrdenAEditar] = useState<OrdenCompraData | null>(null); // ESTADO PARA CONTROLAR LA EDICIÓN
    
  // ELIMINAMOS setMostrarEdicionModal
  const [mostrarNotasModal, setMostrarNotasModal] = useState<OrdenCompraData | null>(null); // ESTADO PARA MODAL DE NOTAS
    
  const initialFormState: PedidoFormState = {
    id_proveedor: '', id_producto: '', fecha: '', cantidad: 0, total: 0.00, notasAdicionales: ''
  };
  const [formData, setFormData] = useState<PedidoFormState>(initialFormState);


  // --- CARGA DE DATOS INICIALES (Proveedores, Productos y Órdenes) ---

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Cargar proveedores
      const provResult = await getProveedores() as { success: boolean, data?: LeadContact[], message: string };
      if (provResult.success && Array.isArray(provResult.data)) {
        const mappedProveedores: SimpleContacto[] = (provResult.data as LeadContact[]).map((p) => ({
          id: Number(p.id), 
          name: p.name,
        }));
        setProveedores(mappedProveedores);
      } else {
        throw new Error(provResult.message || "Fallo al cargar proveedores.");
      }

      // 2. Cargar productos
      const prodResult = await getProductosAlmacen() as { success: boolean, data?: ProductoAlmacenData[], message: string };
            if (prodResult.success && Array.isArray(prodResult.data)) {
                const mappedProductos: SimpleProducto[] = (prodResult.data as ProductoAlmacenData[]).map((p) => ({
                    id: Number(p.id),
                    producto: p.producto,
                    precio: p.precio,
                    especificacion: p.especificacion
                }));
                setProductos(mappedProductos);
            } else {
                throw new Error(prodResult.message || "Fallo al cargar productos.");
            }
            
      // 3. Cargar órdenes de compra
      const orderResult = await getOrders();
      if (orderResult.success && Array.isArray(orderResult.data)) {
        setOrders(orderResult.data as OrdenCompraData[]);
      } else {
        throw new Error(orderResult.message || "Fallo al cargar órdenes.");
      }

    } catch (err: unknown) { // <--- CATCH TIPADO
      console.error("Error cargando datos iniciales:", err);
      setError(`Error al cargar datos: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };
    
    useEffect(() => {
        loadData();
    }, []);

    // --- HANDLERS DE EDICIÓN ---
    
    const handleEditOrder = (orden: OrdenCompraData) => {
    setOrdenAEditar(orden); 
    
    // CORRECCIÓN CLAVE: Convertir todos los IDs numéricos a STRING aquí
    setFormData({
        id_proveedor: String(orden.id_proveedor), // <-- CORRECCIÓN
        id_producto: String(orden.id_producto),   // <-- CORRECCIÓN
        fecha: orden.fecha, 
        cantidad: orden.cantidad,
        total: orden.total,
        notasAdicionales: orden.notas_adicionales,
    });
    
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
    };

    // --- HANDLERS DE FORMULARIO ---

    const handleLimpiarFormulario = (e?: React.MouseEvent | React.FormEvent) => {
        if (e) { e.preventDefault(); }
        setFormData(initialFormState);
        setOrdenAEditar(null); // Sale del modo edición
        setError(null);
        setSuccessMessage(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: (name === 'cantidad' || name === 'total') ? parseFloat(value) || 0 : value
        }));
    };

    const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Mapear el formulario a las claves de la DB (Parcial, no incluye todos los campos de OrdenCompraData)
    const formFields = {
        id_proveedor: parseInt(formData.id_proveedor as string),
        id_producto: parseInt(formData.id_producto as string),
        fecha: formData.fecha,
        cantidad: formData.cantidad,
        total: formData.total,
        notas_adicionales: formData.notasAdicionales,
    };
    
    let result;
    
    // ------------------------------------------------------------------
    // LÓGICA UNIFICADA: CREAR (POST) O EDITAR (PUT)
    // ------------------------------------------------------------------
    
    if (ordenAEditar) { 
        // 1. EDICIÓN (PUT): CONSTRUIMOS EL OBJETO COMPLETO DE ORDEN
        const dataToUpdate = { 
            // Tomamos la orden original (ordenAEditar) y sobrescribimos solo los campos modificados
            ...(ordenAEditar as OrdenCompraData), // <-- Tomamos todos los campos originales (id, estado, nombres, etc.)
            ...formFields,                      // <-- Sobreescribimos con los datos del formulario
            id_pedido: ordenAEditar.id_pedido as number,
            id: ordenAEditar.id, // Aseguramos el ID numérico
        };
        
        // CORREGIDO: Llamamos a updateOrder con el objeto completo
        result = await updateOrder(dataToUpdate); 
        setOrdenAEditar(null); // Sale del modo edición al finalizar

    } else {
        // 2. CREACIÓN (POST)
        // dataToSend aquí es un objeto parcial que coincide con el tipo que createOrder espera (Omit<...>)
        result = await createOrder(formFields);
    }
        
        // ------------------------------------------------------------------

        try {
            if (result.success) {
                setSuccessMessage(result.message);
                handleLimpiarFormulario(e); // Limpia y resetea el formulario
                loadData(); // Recargar lista
            } else {
                setError(result.message);
            }
        } catch (err: unknown) {
            setError('Error al procesar la orden: ' + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };
    
    // --- HANDLERS DE TABLA (DELETE Y UPDATE STATUS) ---
    
    const handleDeleteOrder = async (id: number) => {
        if (!window.confirm(`¿Está seguro de que desea eliminar la orden OC-${id}?`)) return;
        setLoading(true);
        setError(null);
        
        const result = await deleteOrder(id);

        if (result.success) {
            setSuccessMessage(result.message);
            loadData();
        } else {
            setError(result.message);
        }
        setLoading(false);
    };
    
    const handleStatusUpdate = async (id: number, currentStatus: PedidoEstado) => {
        let nextStatus: PedidoEstado;
        if (currentStatus === 'Recibido Completo') {
            nextStatus = 'Solicitado';
        } else if (currentStatus === 'Solicitado') {
            nextStatus = 'Confirmado';
        } else {
            nextStatus = 'Recibido Completo'; 
        }

        if (!window.confirm(`¿Cambiar estado de ${currentStatus} a ${nextStatus} en orden OC-${id}?`)) return;
        setLoading(true);
        setError(null);
        
        const result = await updateOrderStatus(id, nextStatus);

        if (result.success) {
            setSuccessMessage(result.message);
            loadData();
        } else {
            setError(result.message);
        }
        setLoading(false);
    };


    const getStatusClass = (status: PedidoEstado) => {
    switch (status) {
      case 'Solicitado': return 'bg-blue-100 text-blue-800';
      case 'Confirmado': return 'bg-indigo-100 text-indigo-800';
      case 'Enviado': return 'bg-cyan-100 text-cyan-800';
      case 'Recibido Completo': return 'bg-green-100 text-green-800';
      case 'Pendiente de Pago': return 'bg-orange-100 text-orange-800';
      case 'Cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
    // Simular total estimado basado en el producto seleccionado (CALCULADORA)
    useEffect(() => {
        if (formData.id_producto && formData.cantidad > 0) {
            const selectedProduct = productos.find(p => p.id === parseInt(formData.id_producto as string));
            
            if (selectedProduct && selectedProduct.precio) {
                const precio = parseFloat(selectedProduct.precio.replace('$', '').replace(',', '')) || 0;
                const newTotal = precio * formData.cantidad;
                
                if (formData.total !== parseFloat(newTotal.toFixed(2))) {
                    setFormData(prev => ({ ...prev, total: parseFloat(newTotal.toFixed(2)) }));
                }
            }
        } else if (formData.total !== 0) {
             setFormData(prev => ({ ...prev, total: 0.00 }));
        }
    }, [formData.id_producto, formData.cantidad, productos, formData.total]);
    
    
 return (
  <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
        
        {/* Mensajes de estado */}
        {loading && <div className="p-4 text-center text-blue-500">Cargando datos...</div>}
        {error && !loading && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
        {successMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{successMessage}</div>}


   {/* Sección Generar Orden de Compra (FORMULARIO PRINCIPAL) */}
   <div className="mb-10">
    <div className="flex justify-between items-center bg-gray-100 px-4 py-3 rounded-t-md shadow-sm w-full">
     <h2 className="text-2xl font-semibold text-gray-800">
        {ordenAEditar ? 'Editar Orden de Compra' : 'Generar Orden de Compra'}
     </h2>
     <button
      type="button"
      onClick={handleLimpiarFormulario}
      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out"
      disabled={loading}
     >
      {ordenAEditar ? 'Cancelar Edición' : 'Limpiar Formulario'}
     </button>
    </div>
    <div className="bg-white p-6 rounded-b-md shadow-lg">
     <form onSubmit={handleSubmitOrder} className="flex flex-wrap items-start gap-x-6 gap-y-4">
      {/* Proveedor (ID) */}
      <div className="flex-grow basis-0 min-w-[280px]">
       <div className="flex items-center">
        <label htmlFor="id_proveedor" className="text-sm font-medium text-gray-700 mr-3 whitespace-nowrap">Proveedor</label>
        <div className="relative flex-grow">
         <select
          id="id_proveedor"
          name="id_proveedor"
                    value={formData.id_proveedor}
                    onChange={handleInputChange}
                    required
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md appearance-none bg-gray-100 text-gray-900"
         >
          <option value="">Seleccionar Proveedor...</option>
                    {proveedores.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
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
        <label htmlFor="fecha" className="text-sm font-medium text-gray-700 mr-3 whitespace-nowrap">Fecha de Orden</label>
        <div className="relative flex-grow">
         <input
          type="date"
          id="fecha"
          name="fecha"
                    value={formData.fecha}
                    onChange={handleInputChange}
                    required
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100 text-gray-900"
         />
         <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
          <CalendarIcon />
         </div>
        </div>
       </div>
      </div>

      {/* Producto (ID) */}
      <div className="flex-grow basis-0 min-w-[280px]">
       <div className="flex items-center">
        <label htmlFor="id_producto" className="text-sm font-medium text-gray-700 mr-3 whitespace-nowrap">Producto</label>
        <div className="relative flex-grow">
         <select
          id="id_producto"
          name="id_producto"
                    value={formData.id_producto}
                    onChange={handleInputChange}
                    required
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md appearance-none bg-gray-100 text-gray-900"
         >
          <option value="">Seleccionar Producto...</option>
                    {productos.map(p => (
                        <option key={p.id} value={p.id}>{p.producto} ({p.especificacion})</option>
                    ))}
         </select>
         <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
          <ArrowDownIcon />
         </div>
        </div>
       </div>
      </div>

      {/* Total Estimado (Campo de solo lectura) */}
      <div className="flex-grow basis-0 min-w-[280px]">
       <div className="flex items-center">
        <label htmlFor="total" className="text-sm font-medium text-gray-700 mr-3 whitespace-nowrap">Total Estimado</label>
        <div className="relative flex-grow">
         <input
          type="text"
          id="total"
          name="total"
                    value={`$${formData.total.toFixed(2)}`}
                    readOnly // ES SOLO DE LECTURA, CALCULADO
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100 text-gray-900 font-semibold"
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
                    value={formData.cantidad || ''}
                    onChange={handleInputChange}
                    required
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100 text-gray-900"
          placeholder="0"
          min="1"
         />
        </div>
       </div>
      </div>
     
      {/* Notas Adicionales */}
      <div className="flex-grow basis-full"> 
       <div className="flex items-start"> 
        <label htmlFor="notasAdicionales" className="text-sm font-medium text-gray-700 mr-3 whitespace-nowrap pt-2">Notas Adicionales</label>
        <div className="relative flex-grow">
         <textarea
          id="notasAdicionales"
          name="notasAdicionales"
                    value={formData.notasAdicionales}
                    onChange={handleInputChange}
          rows={3}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100 placeholder-gray-400 text-gray-900"
          placeholder="Instrucciones especiales, referencias, etc."
         ></textarea>
        </div>
       </div>
      </div>

      {/* Botón Generar Orden / Guardar Cambios */}
      <div className="w-full flex justify-end mt-4">
       <button
        type="submit"
        disabled={loading}
        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-md shadow-md transition duration-150 ease-in-out disabled:opacity-50"
       >
        {ordenAEditar ? 'Guardar Cambios' : 'Generar Orden'} {/* <-- TEXTO DINÁMICO */}
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
            {orders.length === 0 && !loading && !error ? (
                <div className="p-6 text-center text-gray-500">No hay órdenes de compra registradas.</div>
            ) : (
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
       {orders.map((orden, index) => (
        <tr key={orden.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100 transition-colors'}>
         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{orden.id}</td>
         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{orden.proveedor_nombre}</td>
         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{orden.fecha}</td>
         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">{orden.producto_nombre}</td>
         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{orden.cantidad}</td>
         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${orden.total.toFixed(2)}</td>
         <td className="px-6 py-4 whitespace-nowrap text-sm">
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(orden.estado)}`}>
           {orden.estado}
          </span>
         </td>
         <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center justify-end space-x-2">
           {/* VER DETALLES */}
           <button title="Ver Detalles" onClick={() => setMostrarNotasModal(orden)} disabled={loading} className="text-gray-400 hover:text-blue-600 p-1 rounded-full hover:bg-blue-100 transition-colors disabled:opacity-50">
            <ViewIcon />
           </button>
           
           {/* EDITAR PEDIDO (AHORA PRECÁRGA EL FORMULARIO SUPERIOR) */}
           <button 
                title="Editar Pedido" 
                onClick={() => handleEditOrder(orden)} // <--- ASIGNAMOS EL MANEJADOR
                className="text-gray-400 hover:text-indigo-600 p-1 rounded-full hover:bg-indigo-100 transition-colors disabled:opacity-50" 
                disabled={loading}
           >
            <EditIcon />
           </button>
           
           {/* CAMBIAR ESTADO */}
           <button title="Cambiar Estado" onClick={() => handleStatusUpdate(orden.id_pedido as number, orden.estado)} disabled={loading} className="text-gray-400 hover:text-green-600 p-1 rounded-full hover:bg-green-100 transition-colors disabled:opacity-50">
            <StatusUpdateIcon />
           </button>
           
           {/* ELIMINAR PEDIDO */}
           <button title="Eliminar Pedido" onClick={() => handleDeleteOrder(orden.id_pedido as number)} disabled={loading} className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-red-100 transition-colors disabled:opacity-50">
            <DeleteIcon />
           </button>
          </div>
         </td>
        </tr>
       ))}
            </tbody>
     </table>
            )}
    </div>
   </div>
        
        {/* Modal de Notas Adicionales */}
        {mostrarNotasModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
                <div className="relative mx-auto p-6 border w-full max-w-lg shadow-lg rounded-md bg-white">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Detalles de la Orden {mostrarNotasModal.id}</h3>
                    <p className="text-sm text-gray-800 font-medium mb-2">Proveedor: <span className="font-normal">{mostrarNotasModal.proveedor_nombre}</span></p>
                    <p className="text-sm text-gray-800 font-medium mb-4">Producto: <span className="font-normal">{mostrarNotasModal.producto_nombre}</span></p>

                    <div className="bg-gray-100 p-4 rounded-md">
                        <p className="text-sm font-medium text-gray-700 mb-2">Notas Adicionales:</p>
                        <p className="text-sm text-gray-600 italic">
                            {mostrarNotasModal.notas_adicionales || "No se especificaron notas adicionales para esta orden."}
                        </p>
                    </div>

                    <div className="flex justify-end mt-6">
                        <button
                            onClick={() => setMostrarNotasModal(null)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md shadow-sm"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        )}
        
  </div>
 );
};

export default PedidosPage;