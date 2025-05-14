import React, { useState } from 'react'; // Importar useState

// Componentes de íconos simples (puedes reemplazarlos con una biblioteca de íconos si prefieres)
// const EditIcon: React.FC = () => <span role="img" aria-label="editar">✏️</span>; // Reemplazado por SVG
// const DeleteIcon: React.FC = () => <span role="img" aria-label="eliminar">🗑️</span>; // Reemplazado por SVG

const EditIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path></svg>
);

const DeleteIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
);

// Definimos una interfaz para la estructura de un empleado
interface Empleado {
  id: number;
  nombre: string;
  usuario: string; // Nueva columna
  contrasena: string; // Nueva columna
  cargo: string; // Cambiado de genero a cargo
  correo: string;
  horarioTrabajo: string; // Cambiado de estado a horarioTrabajo
}

const empleadosData: Empleado[] = [
  { id: 1, nombre: "Pat Black", usuario: "pblack", contrasena: "pass123", cargo: "Gerente de Tienda", correo: "bill.berry@example.com", horarioTrabajo: "9 AM - 5 PM" },
  { id: 2, nombre: "Angel Jones", usuario: "ajones", contrasena: "angelP@ss", cargo: "Cocinero Principal", correo: "glen.ramirez@example.com", horarioTrabajo: "2 PM - 10 PM" },
  { id: 3, nombre: "Max Edwards", usuario: "medwards", contrasena: "maxSecure", cargo: "Repartidor", correo: "renee.hughes@example.com", horarioTrabajo: "Turno Variable" },
  { id: 4, nombre: "Bruce Fox", usuario: "bfox", contrasena: "brucelinux", cargo: "Cajero", correo: "craig.kelley@example.com", horarioTrabajo: "10 AM - 6 PM (Fin de Semana)" },
  { id: 5, nombre: "Devon Fisher", usuario: "dfisher", contrasena: "devonFish!", cargo: "Ayudante de Cocina", correo: "joy.ramos@example.com", horarioTrabajo: "8 AM - 4 PM" },
];

const UsuariosPage: React.FC = () => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoEmpleado, setNuevoEmpleado] = useState<Omit<Empleado, 'id'>>({
    nombre: '',
    usuario: '',
    contrasena: '',
    cargo: '',
    correo: '',
    horarioTrabajo: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNuevoEmpleado(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitNuevoEmpleado = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para añadir el empleado a empleadosData
    // Por ahora, solo mostramos en consola y cerramos el formulario
    console.log("Nuevo Empleado a añadir:", nuevoEmpleado);
    // Simular añadir a la lista (esto no persistirá sin un manejo de estado más complejo o API)
    // const nuevoId = empleadosData.length > 0 ? Math.max(...empleadosData.map(emp => emp.id)) + 1 : 1;
    // const empleadoConId = { ...nuevoEmpleado, id: nuevoId };
    // console.log("Empleado con ID:", empleadoConId);
    // Aquí podrías llamar a una función que actualice el estado de empleadosData

    setMostrarFormulario(false);
    setNuevoEmpleado({ // Resetear formulario
      nombre: '',
      usuario: '',
      contrasena: '',
      cargo: '',
      correo: '',
      horarioTrabajo: '',
    });
  };

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <h2 className="text-3xl font-semibold text-gray-800 bg-gray-100 px-4 py-2 rounded-md shadow-sm">
          Empleados
        </h2>
        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Añadir Empleado
        </button>
      </div>

      {/* Formulario para Añadir Empleado (Modal) */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="relative mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-700">Añadir Nuevo Empleado</h3>
              <button
                onClick={() => setMostrarFormulario(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Cerrar modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form onSubmit={handleSubmitNuevoEmpleado} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    name="nombre"
                    id="nombre"
                    value={nuevoEmpleado.nombre}
                    onChange={handleInputChange}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  />
                </div>
                <div>
                  <label htmlFor="usuario" className="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario</label>
                  <input
                    type="text"
                    name="usuario"
                    id="usuario"
                    value={nuevoEmpleado.usuario}
                    onChange={handleInputChange}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  />
                </div>
                <div>
                  <label htmlFor="contrasena" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                  <input
                    type="password"
                    name="contrasena"
                    id="contrasena"
                    value={nuevoEmpleado.contrasena}
                    onChange={handleInputChange}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  />
                </div>
                <div>
                  <label htmlFor="cargo" className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                  <input
                    type="text"
                    name="cargo"
                    id="cargo"
                    value={nuevoEmpleado.cargo}
                    onChange={handleInputChange}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  />
                </div>
                <div>
                  <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    name="correo"
                    id="correo"
                    value={nuevoEmpleado.correo}
                    onChange={handleInputChange}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  />
                </div>
                <div>
                  <label htmlFor="horarioTrabajo" className="block text-sm font-medium text-gray-700 mb-1">Horario de Trabajo</label>
                  <input
                    type="text"
                    name="horarioTrabajo"
                    id="horarioTrabajo"
                    value={nuevoEmpleado.horarioTrabajo}
                    onChange={handleInputChange}
                    placeholder="Ej: 9 AM - 5 PM"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <button type="button" onClick={() => { setMostrarFormulario(false); }} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md shadow-sm">Cancelar</button>
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm">Guardar Empleado</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Nombre
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Usuario
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Contraseña
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Cargo
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Correo Electrónico {/* Cambiado de "Text" a "Correo Electrónico" */}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Horario de Trabajo
              </th>
              <th scope="col" className="relative px-6 py-3 w-28">
                <span className="sr-only">Acciones</span> {/* Para accesibilidad, pero no visible */}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {empleadosData.map((empleado, index) => (
              <tr key={empleado.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100 transition-colors duration-150'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{empleado.nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{empleado.usuario}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{empleado.contrasena}</td> {/* ¡Cuidado con mostrar contraseñas! */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{empleado.cargo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{empleado.correo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{empleado.horarioTrabajo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-3">
                    <button
                      title="Editar"
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-100 transition-colors duration-150"
                    >
                      <EditIcon className="w-5 h-5" /> {/* Ajusta el tamaño si es necesario */}
                    </button>
                    <button
                      title="Eliminar"
                      className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100 transition-colors duration-150"
                    >
                      <DeleteIcon className="w-5 h-5" /> {/* Ajusta el tamaño si es necesario */}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsuariosPage;
