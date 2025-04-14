// src/controllers/AuthController.tsx
import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout'; // Ajusta la ruta si es necesario

// Interfaz para los datos del usuario (puedes ajustarla según tus necesidades)
interface User {
  name: string;
  role: string;
  imageUrl?: string | null;
}

const AuthController: React.FC = () => {
  // Estado para guardar los datos del usuario autenticado
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Intentar leer el usuario desde localStorage al iniciar
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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Efecto para guardar/eliminar el usuario en localStorage cuando cambie el estado
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  // Función para manejar el intento de inicio de sesión
  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    setError(''); // Limpiar errores previos

    // --- SIMULACIÓN DE AUTENTICACIÓN ---
    // Aquí deberías reemplazar esto con tu lógica real de autenticación
    // (por ejemplo, una llamada a tu API backend)
    if (username === 'admin' && password === 'password') {
      // Si la autenticación es exitosa:
      const loggedInUser: User = {
        name: 'Usuario Admin', // Reemplazar con datos reales
        role: 'Administrador', // Reemplazar con datos reales
        imageUrl: null,        // Opcional: URL de imagen
      };
      setCurrentUser(loggedInUser); // Actualizar el estado con los datos del usuario
    } else {
      // Si la autenticación falla:
      setError('Usuario o contraseña incorrectos.');
    }
    // --- FIN SIMULACIÓN ---
  };

  // Función para manejar el cierre de sesión (se pasará a MainLayout)
  const handleLogout = () => {
    setCurrentUser(null); // Limpiar el estado del usuario
    // localStorage se limpiará automáticamente por el useEffect
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
          {/* Puedes añadir un logo aquí si quieres */}
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
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                type="submit"
              >
                Entrar
              </button>
            </div>
            {/* Puedes añadir enlaces como "¿Olvidaste tu contraseña?" aquí */}
          </form>
        </div>
      </div>
    );
  }
};

export default AuthController;
