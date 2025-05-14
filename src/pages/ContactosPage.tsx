// src/pages/ContactosPage.tsx
import React, { useState } from 'react';

// --- Icon Components ---
const ProfileSilhouetteIcon: React.FC<{ className?: string }> = ({ className = "text-gray-300" }) => (
  <svg className={`w-full h-full ${className}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
);

const TagIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={`w-3 h-3 ${className}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a1 1 0 011-1h5a.997.997 0 01.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
  </svg>
);

const EditIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path></svg>
);

const DeleteIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
);

// --- Data Interface ---
interface LeadContact {
  id: string;
  name: string;
  phone: string;
  email: string;
  tag: string;
  profile: {
    type: 'silhouette' | 'initials';
    value?: string; // Initials
    bgColor?: string; // For initials background
    textColor?: string; // For initials text
  };
}

// --- Sample Data ---
const proveedoresDataInicial: LeadContact[] = [ // Renombrado para usar como estado inicial
  {
    id: 'prov1', name: 'Harinas del Sol S.A.', phone: '555-0101', email: 'ventas@harinasdelsol.com', tag: 'Harinas y Secos',
    profile: { type: 'initials', value: 'HS', bgColor: 'bg-yellow-500', textColor: 'text-white' }
  },
  {
    id: 'prov2', name: 'Quesos La Vaquita Feliz', phone: '555-0202', email: 'pedidos@vaquitafeliz.com', tag: 'Lácteos',
    profile: { type: 'silhouette' }
  },
  {
    id: 'prov3', name: 'Vegetales Frescos del Campo', phone: '555-0303', email: 'contacto@vegetalescampo.com', tag: 'Verduras y Hortalizas',
    profile: { type: 'initials', value: 'VF', bgColor: 'bg-green-500', textColor: 'text-white' }
  },
  {
    id: 'prov4', name: 'Empaques Modernos', phone: '555-0404', email: 'info@empaquesmodernos.com', tag: 'Cajas y Desechables',
    profile: { type: 'silhouette' }
  },
];

const trabajadoresDataInicial: LeadContact[] = [ // Renombrado para usar como estado inicial
  {
    id: 'trab1', name: 'Pat Black', phone: '555-1001', email: 'pat.black@pizzatrack.com', tag: 'Gerente de Tienda',
    profile: { type: 'silhouette' }
  },
  {
    id: 'trab2', name: 'Angel Jones', phone: '555-1002', email: 'angel.jones@pizzatrack.com', tag: 'Cocinero Principal',
    profile: { type: 'initials', value: 'AJ', bgColor: 'bg-blue-500', textColor: 'text-white' }
  },
  {
    id: 'trab3', name: 'Max Edwards', phone: '555-1003', email: 'max.edwards@pizzatrack.com', tag: 'Repartidor',
    profile: { type: 'silhouette' }
  },
  {
    id: 'trab4', name: 'Bruce Fox', phone: '555-1004', email: 'bruce.fox@pizzatrack.com', tag: 'Cajero',
    profile: { type: 'initials', value: 'BF', bgColor: 'bg-red-500', textColor: 'text-white' }
  },
];

// --- Contact Card Component ---
interface ContactCardProps {
  contact: LeadContact;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 relative"> {/* Añadido relative aquí */}
      {/* Botones de Acción en la esquina superior derecha */}
      <div className="absolute top-2 right-2 flex space-x-2">
        <button 
          title="Editar Contacto" 
          className="p-1 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors duration-150"
        >
          <EditIcon />
        </button>
        <button 
          title="Eliminar Contacto" 
          className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors duration-150"
        >
          <DeleteIcon />
        </button>
      </div>

      <div className="flex items-start space-x-3 mt-2"> {/* Añadido mt-2 para dar espacio a los botones */}
          {/* Profile Picture */}
          <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden">
            {contact.profile.type === 'silhouette' && (
              <ProfileSilhouetteIcon />
            )}
            {contact.profile.type === 'initials' && contact.profile.value && (
              <div className={`w-full h-full flex items-center justify-center text-sm font-semibold ${contact.profile.bgColor || 'bg-gray-300'} ${contact.profile.textColor || 'text-gray-700'}`}>
                {contact.profile.value}
              </div>
            )}
          </div>
  
          {/* Contact Details */}
          <div className="flex-grow">
            <p className="text-sm font-semibold text-gray-900">{contact.name}</p>
            <p className="text-sm text-gray-900 mt-1.5">{contact.phone}</p>
            <p className="text-xs text-gray-500">{contact.email}</p>
            
            <div className="mt-2">
              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs inline-flex items-center">
                <TagIcon className="mr-1 text-gray-500" />
                {contact.tag}
              </span>
            </div>
          </div>
        </div>
    </div>
  );
};

// --- Main Page Component ---
const ContactosPage: React.FC = () => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [proveedores, setProveedores] = useState<LeadContact[]>(proveedoresDataInicial);
  const [trabajadores, setTrabajadores] = useState<LeadContact[]>(trabajadoresDataInicial);

  // Interfaz para el estado del formulario, incluyendo tipoContacto
  interface NuevoContactoFormState extends Omit<LeadContact, 'id'> {
    tipoContacto: 'proveedor' | 'trabajador';
  }

  const [nuevoContacto, setNuevoContacto] = useState<NuevoContactoFormState>({
    name: '',
    phone: '',
    email: '',
    tag: '',
    profile: {
      type: 'silhouette',
      value: '',
      bgColor: '',
      textColor: '',
    },
    tipoContacto: 'proveedor', // Inicializar tipoContacto
  });

  const resetFormulario = () => {
    setNuevoContacto({ // Asegurarse de resetear todos los campos, incluyendo tipoContacto
      name: '',
      phone: '',
      email: '',
      tag: '',
      profile: { type: 'silhouette', value: '', bgColor: '', textColor: '' },
      tipoContacto: 'proveedor',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const keysOfNuevoContacto = ['name', 'phone', 'email', 'tag', 'tipoContacto'];
    
    if (keysOfNuevoContacto.includes(name)) {
      setNuevoContacto(prev => ({
        ...prev,
        [name]: value,
      }));
    } else if (name.startsWith("profile.")) {
      const profileField = name.split(".")[1] as keyof LeadContact['profile'];
      const updatedProfile = { ...nuevoContacto.profile, [profileField]: value }; // Usar const

      if (profileField === 'type' && value === 'silhouette') {
          updatedProfile.value = '';
          updatedProfile.bgColor = '';
          updatedProfile.textColor = '';
      } 

      setNuevoContacto(prev => ({
        ...prev,
        profile: updatedProfile,
      }));
    }
  };

  const handleSubmitNuevoContacto = (e: React.FormEvent) => {
    e.preventDefault();
    const idTemporal = `contact-${Date.now()}`;
    const contactoCompleto: LeadContact = { ...nuevoContacto, id: idTemporal };
    
    // No necesitamos 'as any' o @ts-ignore ahora que tipoContacto está en NuevoContactoFormState
    if (nuevoContacto.tipoContacto === 'proveedor') {
      setProveedores(prevProveedores => [...prevProveedores, contactoCompleto]);
    } else if (nuevoContacto.tipoContacto === 'trabajador') {
      setTrabajadores(prevTrabajadores => [...prevTrabajadores, contactoCompleto]);
    } else {
      console.warn("Tipo de contacto no especificado o desconocido:", nuevoContacto.tipoContacto);
      // Opcionalmente, añadir a una lista por defecto o mostrar un error
    }

    console.log("Nuevo Contacto añadido:", contactoCompleto, "Tipo:", nuevoContacto.tipoContacto);
    setMostrarFormulario(false);
    resetFormulario();
  };

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      {/* Encabezado de la página con título y botón de añadir */}
      <div className="flex justify-end items-center mb-8 pb-4 border-b border-gray-200"> {/* Cambiado a justify-end para que el botón quede a la derecha */}
        <button
          onClick={() => setMostrarFormulario(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Añadir Contacto
        </button>
      </div>

      {/* Modal del Formulario */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
          <div className="relative mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-700">Añadir Nuevo Contacto</h3>
              <button
                onClick={() => { setMostrarFormulario(false); resetFormulario(); }}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Cerrar modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form onSubmit={handleSubmitNuevoContacto} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="tipoContacto" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Contacto</label>
                  <select name="tipoContacto" id="tipoContacto" value={nuevoContacto.tipoContacto} onChange={handleInputChange} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900">
                    <option value="proveedor">Proveedor</option>
                    <option value="trabajador">Equipo Principal / Trabajador</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                  <input type="text" name="name" id="name" value={nuevoContacto.name} onChange={handleInputChange} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900" />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input type="tel" name="phone" id="phone" value={nuevoContacto.phone} onChange={handleInputChange} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                  <input type="email" name="email" id="email" value={nuevoContacto.email} onChange={handleInputChange} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900" />
                </div>
                <div>
                  <label htmlFor="tag" className="block text-sm font-medium text-gray-700 mb-1">Etiqueta (Ej: Proveedor, Rol)</label>
                  <input type="text" name="tag" id="tag" value={nuevoContacto.tag} onChange={handleInputChange} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900" />
                </div>
              </div>

              <fieldset className="border border-gray-300 p-4 rounded-md">
                <legend className="text-sm font-medium text-gray-700 px-1">Perfil Visual</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                  <div>
                    <label htmlFor="profile.type" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Perfil</label>
                    <select name="profile.type" id="profile.type" value={nuevoContacto.profile.type} onChange={handleInputChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900">
                      <option value="silhouette">Silueta</option>
                      <option value="initials">Iniciales</option>
                    </select>
                  </div>
                  {nuevoContacto.profile.type === 'initials' && (
                    <>
                      <div>
                        <label htmlFor="profile.value" className="block text-sm font-medium text-gray-700 mb-1">Iniciales (Ej: JD)</label>
                        <input type="text" name="profile.value" id="profile.value" value={nuevoContacto.profile.value || ''} onChange={handleInputChange} maxLength={3} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900" />
                      </div>
                      <div>
                        <label htmlFor="profile.bgColor" className="block text-sm font-medium text-gray-700 mb-1">Color Fondo (Clase Tailwind)</label>
                        <input type="text" name="profile.bgColor" id="profile.bgColor" value={nuevoContacto.profile.bgColor || ''} onChange={handleInputChange} placeholder="Ej: bg-blue-500" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900" />
                      </div>
                      <div>
                        <label htmlFor="profile.textColor" className="block text-sm font-medium text-gray-700 mb-1">Color Texto (Clase Tailwind)</label>
                        <input type="text" name="profile.textColor" id="profile.textColor" value={nuevoContacto.profile.textColor || ''} onChange={handleInputChange} placeholder="Ej: text-white" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900" />
                      </div>
                    </>
                  )}
                </div>
              </fieldset>

              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => { setMostrarFormulario(false); resetFormulario(); }} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md shadow-sm">Cancelar</button>
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm">Guardar Contacto</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-10">
          {/* Left Section: Proveedores Clave */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-5">Proveedores Clave ({proveedores.length})</h2>
            <div className="space-y-4">
              {proveedores.map(contact => ( <ContactCard key={contact.id} contact={contact} /> ))}
            </div>
          </section>

          {/* Right Section: Equipo Principal */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-5">Equipo Principal ({trabajadores.length})</h2>
            <div className="space-y-4">
              {trabajadores.map(contact => ( <ContactCard key={contact.id} contact={contact} /> ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ContactosPage;
