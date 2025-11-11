// src/pages/ContactosPage.tsx
import React, { useState, useEffect } from 'react';
import { getContacts, createContact, deleteContact, updateContact, LeadContact } from '../services/contactService'; // Importar funciones de API

// --- Icon Components (Mantenidos) ---
const ProfileSilhouetteIcon: React.FC<{ className?: string }> = ({ className = "text-gray-300" }) => (
 <svg className={`w-full h-full ${className}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
);

const TagIcon: React.FC<{ className?: string }> = ({ className }) => (
 <svg className={`w-3 h-3 ${className}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
  <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 0f12 10V5a1 1 0 011-1h5a.997.997 0 01.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
 </svg>
);

const EditIcon: React.FC<{ className?: string, onClick?: () => void }> = ({ className = "w-4 h-4", onClick }) => (
 <svg onClick={onClick} className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path></svg>
);

const DeleteIcon: React.FC<{ className?: string, onClick?: () => void }> = ({ className = "w-4 h-4", onClick }) => (
 <svg onClick={onClick} className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
);


// --- TIPOS ---
type ContactoFormState = Omit<LeadContact, 'id'> & { id?: string | number | null };
type ContactoConId = LeadContact & { id: string | number };


// --- Contact Card Component (Actualizado con handlers) ---
interface ContactCardProps {
 contact: ContactoConId;
  onEdit: (contact: ContactoConId) => void;
  onDelete: (id: string | number) => void;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact, onEdit, onDelete }) => {
 return (
  <div className="bg-white shadow-md rounded-lg p-4 relative">
   <div className="absolute top-2 right-2 flex space-x-2">
    <button 
     title="Editar Contacto" 
          onClick={() => onEdit(contact)}
     className="p-1 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors duration-150"
    >
     <EditIcon />
    </button>
    <button 
     title="Eliminar Contacto" 
          onClick={() => onDelete(contact.id)}
     className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors duration-150"
    >
     <DeleteIcon />
    </button>
   </div>

   <div className="flex items-start space-x-3 mt-2">
     <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden">
      {contact.profile?.type === 'silhouette' && (<ProfileSilhouetteIcon />)}
      {contact.profile?.type === 'initials' && contact.profile.value && (
       <div className={`w-full h-full flex items-center justify-center text-sm font-semibold ${contact.profile.bgColor || 'bg-gray-300'} ${contact.profile.textColor || 'text-gray-700'}`}>
        {contact.profile.value}
       </div>
      )}
     </div>
 
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
 const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [contactoAEditar, setContactoAEditar] = useState<ContactoConId | null>(null);
  
 const [proveedores, setProveedores] = useState<ContactoConId[]>([]);
 const [trabajadores, setTrabajadores] = useState<ContactoConId[]>([]);

 const initialFormState: ContactoFormState = {
    id: null,
    name: '', phone: '', email: '', tag: '',
    tipoContacto: 'proveedor',
    profile: { 
      type: 'silhouette', 
      value: '', 
      bgColor: '', 
      textColor: '' 
    },
  };
  
 const [formData, setFormData] = useState<ContactoFormState>(initialFormState);


  // --- CARGA DE DATOS (READ) ---
  const loadContacts = async () => {
      setLoading(true);
      setError(null);
      const result = await getContacts();
      
      if (result.success && result.data) {
          const allContacts = result.data as ContactoConId[];
          setProveedores(allContacts.filter(c => c.tipoContacto === 'proveedor'));
          setTrabajadores(allContacts.filter(c => c.tipoContacto === 'trabajador'));
      } else {
          setError(result.message);
      }
      setLoading(false);
  };
  
  useEffect(() => {
      loadContacts();
  }, []); 

  // --- HANDLERS DE FORMULARIO ---
  const resetFormulario = () => setFormData(initialFormState);
  
  const handleCloseForm = () => {
      setMostrarFormulario(false);
      setContactoAEditar(null);
      resetFormulario();
      setError(null);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // 1. Manejo de campos anidados (profile)
    if (name.includes("profile.")) {
        const profileField = name.split(".")[1] as keyof LeadContact['profile'];
        
        // 2. Crear una copia FUERTE del profile actual con valores por defecto garantizados
        // (Esto resuelve el error de 'undefined' porque siempre inicia con valores válidos)
        const currentProfile = formData.profile || { type: 'silhouette', value: '', bgColor: '', textColor: '' };
        
        const updatedProfile = { ...currentProfile, [profileField]: value }; 

        // 3. Lógica para resetear campos si se cambia a Silueta
        if (profileField === 'type' && value === 'silhouette') {
            updatedProfile.value = undefined; 
            updatedProfile.bgColor = undefined;
            updatedProfile.textColor = undefined;
        } 

        // 4. Actualizar el estado con la copia segura
        setFormData(prev => ({ ...prev, profile: updatedProfile as LeadContact['profile'] }));
    } 
    // 5. Manejo de campos directos
    else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
};


  // --- SUBMIT UNIFICADO (CREATE & UPDATE) ---
  const handleSubmitForm = async (e: React.FormEvent) => {
  e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    let result;
    
    // Preparar datos para el envío (eliminar ID si es creación, asegurar ID si es edición)
    const contactToSend = {...formData};
    delete contactToSend.id; // Eliminar ID por defecto, solo se añade si existe en el estado de edición
    
    if (contactoAEditar) {
        // LÓGICA DE EDICIÓN (PUT)
        contactToSend.id = contactoAEditar.id; // Añadir ID al objeto a enviar
        result = await updateContact(contactToSend as LeadContact & { id: string | number }); 
    } else {
        // LÓGICA DE CREACIÓN (POST)
        result = await createContact(contactToSend as Omit<LeadContact, 'id' | 'profile'> & { profile?: LeadContact['profile'] });
    }

    if (result.success) {
        setSuccessMessage(result.message);
        handleCloseForm();
        loadContacts(); // Recargar lista
    } else {
        setError(result.message);
    }
    setLoading(false);
  };
  
  // --- HANDLER DE EDICIÓN (Abrir Modal) ---
  const handleEditClick = (contact: ContactoConId) => {
      setContactoAEditar(contact);
      setFormData({
          ...contact,
          id: contact.id, // Asegurar el ID para el formulario
          // Nota: profile ya está en el objeto contact que pasamos
      });
      setMostrarFormulario(true);
      setError(null);
      setSuccessMessage(null);
  };
  
  // --- HANDLER DE ELIMINACIÓN (DELETE) ---
  const handleDeleteContact = async (id: string | number) => {
      if (!window.confirm(`¿Estás seguro de que deseas eliminar el contacto con ID ${id}?`)) {
          return;
      }
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      const result = await deleteContact(id);
      
      if (result.success) {
          setSuccessMessage(result.message);
          loadContacts(); // Recargar lista
      } else {
          setError(result.message);
      }
      setLoading(false);
  };


 return (
  <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
   {/* Encabezado de la página con título y botón de añadir */}
   <div className="flex justify-end items-center mb-8 pb-4 border-b border-gray-200">
    <button
     onClick={() => { setMostrarFormulario(true); setContactoAEditar(null); resetFormulario(); setError(null); setSuccessMessage(null); }}
     className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out flex items-center"
     disabled={loading}
    >
     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
     </svg>
     Añadir Contacto
    </button>
   </div>

      {/* Mensajes de estado */}
      {loading && <div className="p-4 text-center text-blue-500">Cargando datos...</div>}
      {error && !loading && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
      {successMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{successMessage}</div>}


   {/* Modal del Formulario */}
   {mostrarFormulario && (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
     <div className="relative mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-md bg-white">
      <div className="flex justify-between items-center mb-6">
       <h3 className="text-xl font-semibold text-gray-700">{contactoAEditar ? 'Editar Contacto' : 'Añadir Nuevo Contacto'}</h3>
       <button
        onClick={handleCloseForm}
        className="text-gray-400 hover:text-gray-600"
        aria-label="Cerrar modal"
       >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
       </button>
      </div>
      <form onSubmit={handleSubmitForm} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
         <label htmlFor="tipoContacto" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Contacto</label>
         <select name="tipoContacto" id="tipoContacto" value={formData.tipoContacto} onChange={handleInputChange} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900">
          <option value="proveedor">Proveedor</option>
          <option value="trabajador">Equipo Principal / Trabajador</option>
         </select>
        </div>
        <div>
         <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
         <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900" />
        </div>
        <div>
         <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
         <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleInputChange} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900" />
        </div>
        <div>
         <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
         <input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900" />
        </div>
        <div>
         <label htmlFor="tag" className="block text-sm font-medium text-gray-700 mb-1">Etiqueta (Ej: Proveedor, Rol)</label>
         <input type="text" name="tag" id="tag" value={formData.tag} onChange={handleInputChange} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900" />
        </div>
       </div>

       <fieldset className="border border-gray-300 p-4 rounded-md">
        <legend className="text-sm font-medium text-gray-700 px-1">Perfil Visual</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
         <div>
          <label htmlFor="profile.type" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Perfil</label>
          <select name="profile.type" id="profile.type" value={formData.profile?.type || 'silhouette'} onChange={handleInputChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900">
           <option value="silhouette">Silueta</option>
           <option value="initials">Iniciales</option>
          </select>
        </div>
         {formData.profile?.type === 'initials' && (
          <>
           <div>
            <label htmlFor="profile.value" className="block text-sm font-medium text-gray-700 mb-1">Iniciales (Ej: JD)</label>
            <input type="text" name="profile.value" id="profile.value" value={formData.profile?.value || ''} onChange={handleInputChange} maxLength={3} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900" />
           </div>
           <div>
            <label htmlFor="profile.bgColor" className="block text-sm font-medium text-gray-700 mb-1">Color Fondo (Clase Tailwind)</label>
            <input type="text" name="profile.bgColor" id="profile.bgColor" value={formData.profile?.bgColor || ''} onChange={handleInputChange} placeholder="Ej: bg-blue-500" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900" />
           </div>
           <div>
            <label htmlFor="profile.textColor" className="block text-sm font-medium text-gray-700 mb-1">Color Texto (Clase Tailwind)</label>
            <input type="text" name="profile.textColor" id="profile.textColor" value={formData.profile?.textColor || ''} onChange={handleInputChange} placeholder="Ej: text-white" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900" />
           </div>
         </>
         )}
        </div>
       </fieldset>

       <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={handleCloseForm} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md shadow-sm">Cancelar</button>
        <button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm disabled:opacity-50">
                    {contactoAEditar ? 'Guardar Cambios' : 'Guardar Contacto'}
                </button>
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
       {proveedores.map(contact => ( 
                    <ContactCard 
                        key={contact.id} 
                        contact={contact} 
                        onEdit={handleEditClick} 
                        onDelete={handleDeleteContact}
                    /> 
                ))}
      </div>
     </section>

     {/* Right Section: Equipo Principal */}
     <section>
      <h2 className="text-xl font-semibold text-gray-900 mb-5">Equipo Principal ({trabajadores.length})</h2>
      <div className="space-y-4">
       {trabajadores.map(contact => ( 
                    <ContactCard 
                        key={contact.id} 
                        contact={contact} 
                        onEdit={handleEditClick} 
                        onDelete={handleDeleteContact}
                    /> 
                ))}
      </div>
     </section>
    </div>
   </div>
  </div>
 );
};

export default ContactosPage;