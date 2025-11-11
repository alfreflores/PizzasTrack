import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout'; // Ajusta la ruta si es necesario

// Interfaz para los datos del usuario (reflejando lo que devuelve el backend)
interface User {
  name: string;
  role: string;
  imageUrl?: string | null;
}

// *** IMPORTANTE: AJUSTA ESTA URL ***
// Debe apuntar a tu servidor PHP (ej. XAMPP) y a tu archivo login.php
const API_URL = 'http://localhost/Pizzatrack/backend/api/login.php'; 
// Reemplaza 'pizzatrack' si tu carpeta del proyecto PHP es diferente.

const AuthController: React.FC = () => {
  // Estado para guardar los datos del usuario autenticado
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('currentUser');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error al parsear datos de usuario guardados:", error);
      localStorage.removeItem('currentUser'); // Limpiar si está corrupto
      return null;
    }
  });

  // Estados para los campos del formulario de login
  // Usamos 'username' en el frontend, que corresponde a la columna 'usuario' en la DB
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Nuevo estado para indicar carga

  // Efecto para guardar/eliminar el usuario en localStorage cuando cambie el estado
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
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
            };
            setCurrentUser(loggedInUser);
            // Limpiar campos y errores
            setUsername('');
            setPassword('');
            setError('');

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
              <input
                className={`shadow appearance-none border ${error ? 'border-red-500' : ''} rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline`}
                id="password"
                type="password"
                placeholder="******************"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
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
