import React, { useState, useEffect } from 'react';
// Importamos solo lo necesario desde el servicio de incidencias
import { getIncidencias, createIncidencia, deleteIncidencia, updateIncidenciaStatus, IncidenciaData, ReporteEstado } from '../services/incidenciaService'; 

// --- Icon Components ---
const UserProfileIcon: React.FC<{ className?: string }> = ({ className = "text-gray-500" }) => (
 <svg className={`w-8 h-8 ${className}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
 </svg>
);
const ClockIcon: React.FC<{ className?: string }> = ({ className = "text-gray-400" }) => (
 <svg className={`w-5 h-5 ${className}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
 </svg>
);
const CheckIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
 <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
 </svg>
);
const ReportIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
 <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
  <path fillRule="evenodd" d="M15 2a1 1 0 00-1-1H6a1 1 0 00-1 1v1h10V2zM4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2H4zm3 4a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
 </svg>
);
const DeleteIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
 <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
);

// --- TIPO PARA EL USUARIO LOGUEADO (Lectura de LocalStorage) ---
interface CurrentUser {
    id: string | number; 
    name: string;
    role: string;
}

// Estado inicial del formulario de reporte
interface ReporteFormState {
  id_trabajador: string | number; // Contendrá el ID del usuario logueado
  asunto: string;
  descripcion: string;
}


const ReportesPage: React.FC = () => {
    const [incidencias, setIncidencias] = useState<IncidenciaData[]>([]);
    
    // --- ESTADOS PARA EL USUARIO LOGUEADO ---
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    // --- FIN NUEVOS ESTADOS ---

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    const initialFormState: ReporteFormState = { id_trabajador: '', asunto: '', descripcion: '' };
    const [formData, setFormData] = useState<ReporteFormState>(initialFormState);


    // --- MANEJADORES CRUD ---

    const loadData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Cargar incidencias (ya no cargamos la lista de todos los trabajadores)
            const incidenciasResult = await getIncidencias();
            if (incidenciasResult.success && Array.isArray(incidenciasResult.data)) {
                setIncidencias(incidenciasResult.data as IncidenciaData[]);
            } else {
                throw new Error(incidenciasResult.message || "Fallo al cargar las incidencias.");
            }

        } catch (err: unknown) {
            console.error("Error cargando datos iniciales:", err);
            setError(`Error al cargar datos: ${(err as Error).message}`);
        } finally {
            setLoading(false);
        }
    };
    
    // --- FUNCIÓN DE APERTURA DEL MODAL ---
    const handleOpenForm = () => {
        // 1. Inicializa el formData con el ID del usuario activo
        setFormData(currentUserId ? { ...initialFormState, id_trabajador: currentUserId } : initialFormState);
        
        // 2. Abre el modal
        setMostrarFormulario(true); 
        setError(null); 
        setSuccessMessage(null);
    };

    const handleCloseForm = () => {
        setMostrarFormulario(false);
        // Resetear el formulario al cerrar para la próxima apertura
        setFormData(currentUserId ? { ...initialFormState, id_trabajador: currentUserId } : initialFormState);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        // Solo cambiamos asunto y descripción, el ID de trabajador es fijo/oculto
        if (name !== 'id_trabajador') {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmitReporte = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        // VALIDACIÓN: El ID de trabajador DEBE ser el del usuario logueado
        if (!currentUserId || !formData.id_trabajador) {
             setError("Error: El usuario activo no fue detectado. No se puede crear el reporte.");
             setLoading(false);
             return;
        }

        const dataToSend = {
            id_trabajador: Number(currentUserId), // Aseguramos que el ID es un número
            asunto: formData.asunto,
            descripcion: formData.descripcion,
        };

        try {
            const result = await createIncidencia(dataToSend);

            if (result.success) {
                setSuccessMessage(result.message);
                handleCloseForm(); // Cierra y resetea
                loadData(); // Recargar lista
            } else {
                setError(result.message);
            }
        } catch (err: unknown) {
            setError('Error al crear el reporte: ' + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };
    
    // --- HANDLERS DE TABLA (DELETE Y UPDATE STATUS) ---
    const handleDeleteIncidencia = async (id_reporte: number) => {
        if (!window.confirm(`¿Está seguro de eliminar el reporte ${id_reporte}?`)) return;
        setLoading(true);
        setError(null);

        const result = await deleteIncidencia(id_reporte);

        if (result.success) {
            setSuccessMessage(result.message);
            loadData();
        } else {
            setError(result.message);
        }
        setLoading(false);
    };
    
    const handleStatusUpdate = async (id_reporte: number, currentStatus: ReporteEstado) => {
        const nextStatus: ReporteEstado = currentStatus === 'pendiente' ? 'en_proceso' : (currentStatus === 'en_proceso' ? 'resuelto' : 'cerrado');
        
        if (!window.confirm(`¿Cambiar estado del reporte ${id_reporte} de ${currentStatus} a ${nextStatus}?`)) return;
        setLoading(true);
        setError(null);

        const result = await updateIncidenciaStatus(id_reporte, nextStatus);

        if (result.success) {
            setSuccessMessage(result.message);
            loadData();
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    // --- Cargar el Usuario Logueado y Datos ---
    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        let userId = null;
        
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                const rawId = user.id || user.id_usuario; 
                userId = Number(rawId); 

                if (!isNaN(userId) && userId > 0) {
                    setCurrentUser(user as CurrentUser);
                    setCurrentUserId(userId);
                }
            } catch (e) {
                console.error("Error al leer sesión:", e);
                setError("Error al procesar la información del usuario logueado.");
            }
        }
        
        loadData(); // Mantenemos la carga de reportes aquí
    }, []);

    // --- HELPERS VISUALES ---

    const getStatusStyles = (status: ReporteEstado) => {
        switch (status) {
            case 'pendiente': return { cardBg: 'bg-red-100', textColor: 'text-red-800', badge: 'bg-red-500' };
            case 'en_proceso': return { cardBg: 'bg-yellow-100', textColor: 'text-yellow-800', badge: 'bg-yellow-500' };
            case 'resuelto': return { cardBg: 'bg-green-100', textColor: 'text-green-800', badge: 'bg-green-500' };
            case 'cerrado': return { cardBg: 'bg-gray-100', textColor: 'text-gray-600', badge: 'bg-gray-500' };
            default: return { cardBg: 'bg-white', textColor: 'text-gray-800', badge: 'bg-gray-400' };
        }
    };
    
    // Función para formatear la fecha
    const formatTime = (isoString: string): string => {
        const date = new Date(isoString);
        return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const formatDate = (isoString: string): string => {
        const date = new Date(isoString);
        return date.toLocaleDateString('es-MX');
    };


    // Renderizado de tarjetas de reporte
    const ReportCard: React.FC<{ incidencia: IncidenciaData }> = ({ incidencia: card }) => {
        const styles = getStatusStyles(card.estado);
        const isClosed = card.estado === 'cerrado' || card.estado === 'resuelto';
        
        return (
            <div className={`rounded-lg shadow-md transition-shadow duration-300 ${styles.cardBg} border-l-4 p-4`} style={{ borderColor: styles.badge }}>
                <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3 flex-grow">
                        <div className="flex-shrink-0 pt-1">
                            <UserProfileIcon className={styles.badge} />
                        </div>
                        <div className="flex-grow">
                            <p className={`font-semibold text-sm ${styles.textColor}`}>{`${card.puesto_trabajador}: ${card.nombre_trabajador}`}</p>
                            <p className="text-lg font-bold text-gray-900 mt-1">{card.asunto}</p>
                            <p className="text-sm text-gray-600 mt-1">{card.descripcion}</p>
                            
                            <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                                <ClockIcon className="w-4 h-4 text-gray-400" />
                                <span>{formatDate(card.fecha_creacion)} {formatTime(card.fecha_creacion)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2 pt-1 text-xs">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full text-white ${styles.badge} capitalize`}>
                            {card.estado.replace('_', ' ')}
                        </span>
                        
                        {/* Botón de Cambio de Estado */}
                        {!isClosed && (
                            <button
                                onClick={() => handleStatusUpdate(card.id_reporte, card.estado)}
                                title={`Mover a ${card.estado === 'pendiente' ? 'En Proceso' : 'Resuelto'}`}
                                className="text-white bg-indigo-500 hover:bg-indigo-600 p-1 rounded-full transition-colors shadow-sm"
                                disabled={loading}
                            >
                                <CheckIcon className="w-5 h-5" />
                            </button>
                        )}
                        
                        {/* Botón de Eliminar */}
                        <button
                            onClick={() => handleDeleteIncidencia(card.id_reporte)}
                            title="Eliminar Reporte"
                            className={`p-1 rounded-full transition-colors duration-150 ${isClosed ? 'text-gray-400 hover:text-red-600 hover:bg-red-100' : 'text-white bg-red-600 hover:bg-red-700'}`}
                            disabled={loading}
                        >
                            <DeleteIcon />
                        </button>
                    </div>
                </div>
            </div>
        );
    };


 return (
  <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
   <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
    <h2 className="text-3xl font-semibold text-gray-800">Gestión de Reportes e Incidencias</h2>
    <button
     type="button"
     onClick={handleOpenForm} // Llama a la función de apertura simplificada
     className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out flex items-center"
     title="Crear un nuevo reporte"
     disabled={loading || !currentUserId} // Deshabilitar si no hay usuario
    >
     <ReportIcon className="w-5 h-5 mr-2" />
     Reporte
    </button>
   </div>

      {/* Mensajes de estado */}
      {loading && <div className="p-4 text-center text-blue-500">Cargando reportes...</div>}
      {error && !loading && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
      {successMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{successMessage}</div>}


      {/* Modal para Crear Reporte */}
      {mostrarFormulario && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
              <div className="relative mx-auto p-6 border w-full max-w-xl shadow-lg rounded-md bg-white">
                  <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Crear Nuevo Reporte de Incidencia</h3>
                  <form onSubmit={handleSubmitReporte} className="space-y-4">
                      
                      {/* --- CAMPO TRABAJADOR: AHORA SOLO LECTURA --- */}
                      <div>
                          <label htmlFor="trabajador_info" className="block text-sm font-medium text-gray-700 mb-1">Trabajador que reporta</label>
                          <input 
                              type="text" 
                              id="trabajador_info" 
                              name="trabajador_info" 
                              // Muestra el nombre y puesto del usuario activo
                              value={currentUser ? `${currentUser.name} (${currentUser.role})` : 'Usuario no detectado'} 
                              readOnly // ESTO LO HACE SOLO DE LECTURA
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm text-gray-900 bg-gray-100"
                          />
                          {/* Campo Oculto para enviar el ID real al backend */}
                          <input 
                              type="hidden" 
                              name="id_trabajador" 
                              value={currentUserId || ''} // Aseguramos que el ID se envíe
                          />
                      </div>
                      {/* --- FIN CAMPO TRABAJADOR --- */}
                      
                      {/* Campo Asunto/Reporte */}
                      <div>
                          <label htmlFor="asunto" className="block text-sm font-medium text-gray-700 mb-1">Asunto del Reporte</label>
                          <input 
                              type="text" 
                              id="asunto" 
                              name="asunto" 
                              value={formData.asunto} 
                              onChange={handleInputChange} 
                              required 
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                          />
                      </div>

                      {/* Campo Descripción */}
                      <div>
                          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">Descripción Detallada</label>
                          <textarea 
                              id="descripcion" 
                              name="descripcion" 
                              value={formData.descripcion} 
                              onChange={handleInputChange} 
                              rows={4}
                              required 
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                          />
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-4">
                          <button type="button" onClick={handleCloseForm} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md shadow-sm">Cancelar</button>
                          <button type="submit" disabled={loading || !currentUserId} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm disabled:opacity-50">
                              {loading ? 'Enviando...' : 'Crear Reporte'}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}


  <div className="space-y-6">
    {incidencias.length === 0 && !loading && !error ? (
            <div className="p-6 text-center text-gray-500 bg-white rounded-lg shadow-md">No hay reportes de incidencias registrados.</div>
        ) : (
            incidencias.map((card) => <ReportCard key={card.id_reporte} incidencia={card} />)
        )}
   </div>
  </div>
 );
};

export default ReportesPage;