// src/pages/ReportesPage.tsx
import React from 'react';

// Placeholder Icon Components (reemplazar con una biblioteca de íconos si se desea)
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

const CheckIcon: React.FC<{ className?: string }> = ({ className = "text-green-500" }) => (
  <svg className={`w-5 h-5 ${className}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
  </svg>
);
const ChatIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
  </svg>
);
const DeleteIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => ( // Ícono de Eliminar (papelera)
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
);

interface ReportCardData {
  id: number;
  userPuesto: string; // Puesto/Rol del usuario
  userName: string;   // Nombre del usuario
  message: string;
  time?: string; // Opcional, ya que no todas las descripciones lo mencionan explícitamente
  asunto?: string; // Nuevo campo para el asunto
  status: 'respondido' | 'pendiente'; // Nuevo campo para el estado de respuesta
  isVerified?: boolean;
}

const reportCards: ReportCardData[] = [
  {
    id: 1,
    userPuesto: "Gerente de Tienda", // Coincide con el cargo de Pat Black
    userName: "Pat Black",
    message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    time: "10:30 AM",
    asunto: "Pedido Nuevo",
    status: 'respondido', // Ya se respondió -> blanco
  },
  {
    id: 2,
    userPuesto: "Cocinero Principal", // Coincide con el cargo de Angel Jones
    userName: "Angel Jones",
    message: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    time: "11:15 AM",
    asunto: "Consulta de Contacto",
    status: 'pendiente', // No se ha respondido -> verde
  },
  {
    id: 3,
    userPuesto: "Repartidor", // Coincide con el cargo de Max Edwards
    userName: "Max Edwards",
    message: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    time: "12:00 PM",
    asunto: "Actualización de Almacén",
    status: 'respondido', // Ya se respondió -> blanco
    isVerified: true,
  },
  {
    id: 4,
    userPuesto: "Cajero", // Coincide con el cargo de Bruce Fox
    userName: "Bruce Fox",
    message: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    time: "01:45 PM",
    asunto: "Reporte de Usuario",
    status: 'pendiente', // No se ha respondido -> verde
    isVerified: true,
  },
  {
    id: 5,
    userPuesto: "Sistema", // Este puede quedar como un remitente genérico del sistema
    userName: "Notificación Automática",
    message: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
    time: "02:30 PM",
    asunto: "Incidencia General",
    status: 'respondido', // Ya se respondió -> blanco
  },
];

const ReportesPage: React.FC = () => {
  // Estado para manejar los reportes si se implementa la eliminación real en la UI
  const [currentReportCards, setCurrentReportCards] = React.useState<ReportCardData[]>(reportCards);

  const handleDeleteReport = (reportId: number) => {
    console.log(`Intentando eliminar reporte con ID: ${reportId}`);
    // Para eliminar visualmente de la lista (descomentar si se desea esta funcionalidad):
    setCurrentReportCards(prevReports => prevReports.filter(report => report.id !== reportId));
  };
  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-end items-center mb-8 pb-4 border-b border-gray-200"> {/* Cambiado a justify-end */}
        <button
          type="button"
          // onClick={() => { /* Lógica para iniciar chat aquí */ }}
          className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out flex items-center"
          title="Iniciar un chat"
        >
          <ChatIcon className="mr-2" />
          Chatear
        </button>
      </div>
      <div className="space-y-6">
        {currentReportCards.map((card) => {
          const isResponded = card.status === 'respondido';
          const cardBg = isResponded ? 'bg-white' : 'bg-green-600';
          const textColor = isResponded ? 'text-gray-800' : 'text-white';
          const subTextColor = isResponded ? 'text-gray-600' : 'text-green-100'; // Un verde más claro para el texto secundario en tarjetas verdes
          const iconColor = isResponded ? 'text-gray-500' : 'text-white';
          const clockColor = isResponded ? 'text-gray-400' : 'text-green-100';

          return (
            <div key={card.id} className={`rounded-lg shadow-md overflow-hidden ${cardBg}`}>
              <div className={`p-4 flex items-start space-x-4 ${isResponded ? 'bg-gray-50 border-b border-gray-200' : ''}`}>
                <div className="flex-shrink-0 pt-1">
                  <UserProfileIcon className={iconColor} />
                </div>
                <div className="flex-grow">
                  <p className={`font-semibold ${textColor}`}>{`${card.userPuesto}: ${card.userName}`}</p>
                  <p className={`text-sm mt-1 ${subTextColor}`}>{card.message}</p>
                </div>
                <div className="flex-shrink-0 flex flex-col items-end space-y-2 pt-1 text-xs"> {/* Aumentado space-y-2 para el nuevo botón */}
                  {card.time && (
                    <div className="flex items-center">
                      <ClockIcon className={`${clockColor} mr-1`} />
                      <span className={subTextColor}>Hora de envío: {card.time}</span>
                    </div>
                  )}
                  {card.asunto && <span className={`font-medium ${textColor}`}>{card.asunto}</span>}
                  {/* La palomita indica si el asunto está verificado/atendido correctamente */}
                  {card.isVerified ? (
                    <CheckIcon className={isResponded ? 'text-green-500' : 'text-white'} />
                  ) : (
                    <span className={`text-xs ${subTextColor}`}>Pendiente de atención</span> // Opcional: texto si no está verificado
                  )}
                  <button
                    onClick={() => handleDeleteReport(card.id)}
                    title="Eliminar Reporte"
                    className={`p-1 rounded-full transition-colors duration-150 
                                ${isResponded ? 'text-gray-400 hover:text-red-600 hover:bg-red-100' 
                                             : 'text-green-200 hover:text-red-500 hover:bg-red-700 hover:bg-opacity-50'}`}
                  >
                    <DeleteIcon />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReportesPage;