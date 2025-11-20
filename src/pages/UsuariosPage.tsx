// src/pages/UsuariosPage.tsx (Código Corregido para Edición)

import React, { useState, useEffect } from 'react'; 
import { getEmpleados, createEmpleado, deleteEmpleado, updateEmpleado, EmpleadoData } from '../services/userService'; // <-- Importamos updateEmpleado

// Componentes de íconos (Mantener)
const EditIcon: React.FC<{ className?: string, onClick?: () => void }> = ({ className = "w-4 h-4", onClick }) => (
 <svg onClick={onClick} className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path></svg>
);

const DeleteIcon: React.FC<{ className?: string, onClick?: () => void }> = ({ className = "w-4 h-4", onClick }) => (
 <svg onClick={onClick} className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
);

// Tipo para un empleado que ya existe en la BD (siempre tiene ID)
type EmpleadoConId = EmpleadoData & { id: number };

const UsuariosPage: React.FC = () => {
 // 1. ESTADOS PARA GESTIÓN DE DATOS Y UI
  const [empleados, setEmpleados] = useState<EmpleadoConId[]>([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [empleadoAEditar, setEmpleadoAEditar] = useState<EmpleadoConId | null>(null); // Estado para rastrear si estamos editando
  
  // Usaremos este estado para el formulario, incluyendo el ID si estamos editando
  const [formData, setFormData] = useState<Omit<EmpleadoData, 'id'> | EmpleadoConId>({
    nombre: '', usuario: '', contrasena: '', cargo: '', correo: '', horarioTrabajo: '',
  });

    // --- LÓGICA DE CARGA (READ) ---
    const loadEmpleados = async () => {
        setLoading(true);
        setError(null);
        const result = await getEmpleados();
        
        if (result.success && result.data) {
            setEmpleados(result.data as EmpleadoConId[]);
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    // --- MANEJADOR UNIFICADO DE SUBMIT (CREATE/UPDATE) ---
    const handleSubmitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        let result;
        
        if (empleadoAEditar) {
            // LÓGICA DE EDICIÓN (PUT)
            const dataToUpdate = formData as EmpleadoConId;

            // Si la contraseña está vacía, no la enviamos para que PHP no la toque
            if (dataToUpdate.contrasena === '********' || dataToUpdate.contrasena === '') {
                delete dataToUpdate.contrasena;
            }
            
            result = await updateEmpleado(dataToUpdate); // Llama a la función PUT

        } else {
            // LÓGICA DE CREACIÓN (POST)
            result = await createEmpleado(formData as Omit<EmpleadoData, 'id'>);
        }

        if (result.success) {
            setSuccessMessage(result.message);
            setMostrarFormulario(false);
            setEmpleadoAEditar(null); // Resetear modo edición
            setFormData({ nombre: '', usuario: '', contrasena: '', cargo: '', correo: '', horarioTrabajo: '', });
            loadEmpleados(); // Recargar lista
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    // --- LÓGICA DE ELIMINACIÓN (DELETE) ---
    const handleDeleteEmpleado = async (id: number) => {
        if (!window.confirm(`¿Estás seguro de que deseas eliminar al empleado con ID ${id}? Esta acción es irreversible.`)) {
            return;
        }
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        const result = await deleteEmpleado(id);

        if (result.success) {
            setSuccessMessage(result.message);
            loadEmpleados(); // Recargar lista
        } else {
            setError(result.message);
        }
        setLoading(false);
    };
    
    // --- MANEJADOR DE EDICIÓN (Abre el modal con datos) ---
    const handleEditClick = (empleado: EmpleadoConId) => {
        setEmpleadoAEditar(empleado); // Habilita el modo edición
        // Precarga el formulario con todos los datos
        setFormData({ ...empleado, contrasena: '' }); // Contraseña vacía por seguridad (no se envía si no se modifica)
        setMostrarFormulario(true);
        setError(null);
        setSuccessMessage(null);
    };
    
    // --- MANEJADOR DE INPUTS ---
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 5. EFECTO PARA CARGAR DATOS AL INICIO
    useEffect(() => {
      loadEmpleados();
    }, []); 

 return (
  <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
   <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
    <h2 className="text-3xl font-semibold text-gray-800 bg-gray-100 px-4 py-2 rounded-md shadow-sm">
     Gestión de Empleados
    </h2>
    <button
     onClick={() => { setMostrarFormulario(true); setEmpleadoAEditar(null); setFormData({ nombre: '', usuario: '', contrasena: '', cargo: '', correo: '', horarioTrabajo: '', }); setError(null); setSuccessMessage(null); }}
     className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out flex items-center"
    >
     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
     </svg>
     Añadir Empleado
    </button>
   </div>

      {/* Mensajes de estado */}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
      {successMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{successMessage}</div>}


   {/* Formulario para Añadir/Editar Empleado (Modal) */}
   {mostrarFormulario && (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
     <div className="relative mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-md bg-white">
      <div className="flex justify-between items-center mb-6">
       <h3 className="text-xl font-semibold text-gray-700">{empleadoAEditar ? 'Editar Empleado' : 'Añadir Nuevo Empleado'}</h3>
       <button
        onClick={() => { setMostrarFormulario(false); setEmpleadoAEditar(null); }}
        className="text-gray-400 hover:text-gray-600"
        aria-label="Cerrar modal"
       >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
       </button>
      </div>
      <form onSubmit={handleSubmitForm} className="space-y-6"> {/* Usa handleSubmitForm unificado */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div><label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label><input type="text" name="nombre" id="nombre" value={formData.nombre} onChange={handleInputChange} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"/></div>
        <div><label htmlFor="usuario" className="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario</label><input type="text" name="usuario" id="usuario" value={formData.usuario} onChange={handleInputChange} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"/></div>
        <div><label htmlFor="contrasena" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label><input type="password" name="contrasena" id="contrasena" value={formData.contrasena} onChange={handleInputChange} required={!empleadoAEditar} placeholder={empleadoAEditar ? 'Dejar vacío para no cambiar' : ''} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"/></div>
        <div><label htmlFor="cargo" className="block text-sm font-medium text-gray-700 mb-1">Cargo</label><input type="text" name="cargo" id="cargo" value={formData.cargo} onChange={handleInputChange} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"/></div>
        <div><label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label><input type="email" name="correo" id="correo" value={formData.correo} onChange={handleInputChange} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"/></div>
        <div><label htmlFor="horarioTrabajo" className="block text-sm font-medium text-gray-700 mb-1">Horario de Trabajo</label><input type="text" name="horarioTrabajo" id="horarioTrabajo" value={formData.horarioTrabajo} onChange={handleInputChange} placeholder="Ej: 9 AM - 5 PM" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"/></div>
       </div>
       <div className="flex justify-end space-x-3 mt-4">
        <button type="button" onClick={() => { setMostrarFormulario(false); setEmpleadoAEditar(null); }} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md shadow-sm">Cancelar</button>
        <button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm disabled:opacity-50">
                    {loading ? 'Guardando...' : (empleadoAEditar ? 'Guardar Cambios' : 'Guardar Empleado')}
                </button>
       </div>
      </form>
     </div>
    </div>
   )}

   <div className="bg-white shadow-xl rounded-lg overflow-hidden mt-4">
        {loading && <div className="p-4 text-center text-blue-500">Cargando usuarios...</div>}
        {error && !loading && <div className="p-4 text-center text-red-600 font-semibold">{error}</div>}

    {(!loading && !error && empleados.length > 0) ? (
            <table className="min-w-full divide-y divide-gray-200">
     <thead className="bg-gray-100">
      <tr>
       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contraseña</th>
       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo Electrónico</th>
       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horario de Trabajo</th>
       <th scope="col" className="relative px-6 py-3 w-28">
        <span className="sr-only">Acciones</span> 
       </th>
      </tr>
     </thead>
     <tbody className="bg-white divide-y divide-gray-200">
      {empleados.map((empleado, index) => ( // USAMOS EL ESTADO 'empleados'
       <tr key={empleado.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100 transition-colors duration-150'}>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{empleado.nombre}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{empleado.usuario}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{empleado.contrasena}</td> 
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{empleado.cargo}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{empleado.correo}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{empleado.horarioTrabajo}</td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
         <div className="flex items-center justify-end space-x-3">
          <button title="Editar" onClick={() => handleEditClick(empleado)} className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-100 transition-colors duration-150"><EditIcon className="w-5 h-5" /></button>
          <button 
                        title="Eliminar" 
                        onClick={() => handleDeleteEmpleado(empleado.id)} // Llama a la función DELETE
                        disabled={loading}
                        className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100 transition-colors duration-150 disabled:opacity-50"
                    >
                        <DeleteIcon className="w-5 h-5" />
                    </button>
         </div>
        </td>
       </tr>
      ))}
     </tbody>
    </table>
        ) : (!loading && !error && empleados.length === 0) ? (
            <div className="p-4 text-center text-gray-500">No hay empleados registrados. ¡Añade uno para empezar!</div>
        ) : null}
   </div>
  </div>
 );
};

    export default UsuariosPage;