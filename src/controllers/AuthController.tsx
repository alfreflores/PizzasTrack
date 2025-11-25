import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout'; // Ajusta la ruta si es necesario
import { useNavigate } from 'react-router-dom'; // [NUEVO]

// Interfaz para los datos del usuario (reflejando lo que devuelve el backend)
interface User {
 name: string;
 role: string;
 imageUrl?: string | null;
  id?: number | string; // <--- CORRECCIÓN 1: Incluir el ID para Reportes
}

// *** IMPORTANTE: AJUSTA ESTA URL ***
const API_URL = 'http://localhost/Pizzatrack/backend/api/login.php'; 
// Reemplaza 'pizzatrack' si tu carpeta del proyecto PHP es diferente.

const AuthController: React.FC = () => {
 // Estado para guardar los datos del usuario autenticado
 const navigate = useNavigate();

 const [currentUser, setCurrentUser] = useState<User | null>(() => {
  const storedUser = sessionStorage.getItem('currentUser');
  try {
   return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
   console.error("Error al parsear datos de usuario guardados:", error);
   sessionStorage.removeItem('currentUser'); // Limpiar si está corrupto
   return null;
  }
 });

 // Estados para los campos del formulario de login
 const [username, setUsername] = useState('');
 const [showPassword, setShowPassword] = useState(false);
 const [password, setPassword] = useState('');
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false); // Nuevo estado para indicar carga

 // Efecto para guardar/eliminar el usuario en localStorage cuando cambie el estado
 useEffect(() => {
  if (currentUser) {
   sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
  } else {
   sessionStorage.removeItem('currentUser');
  }
 }, [currentUser]);

 // Función para manejar el intento de inicio de sesión
 const handleLogin = async (event: React.FormEvent) => {
  event.preventDefault();
  setError('');
  setLoading(true); // Iniciar carga

  // Datos a enviar al backend (PHP)
  const loginData = {
    // El backend PHP espera un campo 'usuario'
    usuario: username, 
    password: password,
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    // La respuesta siempre debe ser leída como JSON
    const data = await response.json();

    if (response.ok && data.success) {
      // Autenticación Exitosa (código 200 y success: true)
      const loggedInUser: User = {
        // Mapear los datos que envía el backend
        name: data.user.name, 
        role: data.user.role, 
        imageUrl: data.user.imageUrl || null, 
        id: data.user.id, // <--- CORRECCIÓN 2: Guardamos el ID del usuario
      };
      setCurrentUser(loggedInUser);
      // Limpiar campos y errores
      setUsername('');
      setPassword('');
      setError('');

      navigate('/');

    } else {
      // Autenticación Fallida (ej. error 401 del PHP o success: false)
      // Usar el mensaje de error que viene del backend
      setError(data.message || 'Credenciales incorrectas o error desconocido.');
    }

  } catch (err) {
    // Error de Red o del Servidor (PHP no corre, CORS, etc.)
    console.error("Error en la solicitud de login:", err);
    setError('No se pudo conectar con el servidor. Verifica tu API URL y el servidor PHP (XAMPP/WAMP).');
  } finally {
    setLoading(false); // Finalizar carga
  }
 };

 // Función para manejar el cierre de sesión (se pasará a MainLayout)
 const handleLogout = () => {
  setCurrentUser(null); 
 };

 // --- RENDERIZADO CONDICIONAL ---
 if (currentUser) {
  // Si hay un usuario autenticado (currentUser no es null), renderiza MainLayout
  return (
   <MainLayout
    userName={currentUser.name}
    userRole={currentUser.role}
    userImageUrl={currentUser.imageUrl}
    onLogout={handleLogout} // Pasar la función de logout
   />
  );
 } else {
  // Si no hay usuario autenticado, renderiza el formulario de Login
  return (
   <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="p-8 bg-white rounded shadow-md w-full max-w-sm">
     <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Iniciar Sesión</h2>
     <form onSubmit={handleLogin}>
      <div className="mb-4">
       <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
        Usuario
       </label>
       <input
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        id="username"
        type="text"
        placeholder="Tu usuario"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
       />
      </div>
    <div className="mb-6">
    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
        Contraseña
    </label>
    <div className="relative"> {/* Contenedor relativo para posicionar el ícono */}
        <input
            className={`shadow appearance-none border ${error ? 'border-red-500' : ''} rounded w-full py-2 px-3 pr-10 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline`}
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="******************"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
        />
        {/* Botón/Icono de Ojo para alternar visibilidad */}
        <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 top-0 mt-0.5 pr-3 flex items-center text-sm leading-5"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
            {showPassword ? (
                // Ícono de ojo tachado (ocultar)
                <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.016 10.016 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.022-7 9.542-7 1.09 0 2.146.19 3.136.545M19.88 16.88L5.12 2.12M17.414 7.586a2 2 0 112.828 2.828L7.586 17.414a2 2 0 11-2.828-2.828L17.414 7.586z" /></svg>
            ) : (
                // Ícono de ojo abierto (mostrar)
                <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.023 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" /></svg>
            )}
        </button>
    </div>
    {error && <p className="text-red-500 text-xs italic">{error}</p>}
</div>
      <div className="flex items-center justify-between">
       <button
        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        type="submit"
        disabled={loading} // Deshabilitar si está cargando
       >
        {loading ? 'Cargando...' : 'Entrar'}
       </button>
      </div>
     </form>
    </div>
   </div>
  );
 }
};

export default AuthController;
