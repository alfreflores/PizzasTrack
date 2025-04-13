// src/controllers/AuthController.tsx
import React, { useState, useEffect } from 'react';
import Login from '../components/Login';
import MainLayout from '../components/MainLayout';

// Define la estructura del usuario
interface User {
  name: string;
  role: string;
  imageUrl?: string | null;
}

const AuthController: React.FC = () => {
  // Estado para saber si está autenticado
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  // Estado para guardar los datos del usuario
  const [user, setUser] = useState<User | null>(null);
  // Estado para saber si estamos verificando la sesión inicial
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // useEffect para verificar la sesión al cargar la aplicación
  useEffect(() => {
    console.log("AuthController: Verificando sesión inicial...");
    // Intenta leer del localStorage si el usuario ya inició sesión antes
    const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';

    if (loggedInStatus) {
      console.log("AuthController: Sesión activa encontrada.");
      // Si estaba logueado, recupera los datos (simulados)
      const storedUser: User = {
        name: localStorage.getItem('userName') || 'Usuario Recuperado',
        role: localStorage.getItem('userRole') || 'Rol Recuperado',
        imageUrl: localStorage.getItem('userImageUrl') || null,
      };
      setUser(storedUser);
      setIsAuthenticated(true);
    } else {
      console.log("AuthController: No hay sesión activa.");
    }
    // Termina la carga inicial
    setIsLoading(false);
  }, []); // El array vacío [] asegura que esto se ejecute solo una vez al montar

  // Función que se llama desde Login cuando el login es exitoso
  const handleLoginSuccess = () => {
    console.log("AuthController: Login exitoso procesado.");
    // --- Simulación: Datos del usuario después del login ---
    // En una app real, estos datos vendrían de la respuesta del API
    const loggedInUser: User = {
      name: 'Admin Kristal', // Puedes cambiar esto o obtenerlo del login
      role: 'Administrador',
      imageUrl: null, // O una URL si la tienes
    };
    // --- Fin Simulación ---

    // Guarda el estado en localStorage (simulación de sesión)
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', loggedInUser.name);
    localStorage.setItem('userRole', loggedInUser.role);
    if (loggedInUser.imageUrl) {
      localStorage.setItem('userImageUrl', loggedInUser.imageUrl);
    } else {
      localStorage.removeItem('userImageUrl'); // Asegura limpiar si no hay imagen
    }

    // Actualiza el estado de React
    setUser(loggedInUser);
    setIsAuthenticated(true);
  };

  // Función que se llama desde Sidebar para cerrar sesión
  const handleLogout = () => {
    console.log("AuthController: Logout procesado.");
    // Limpia localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userImageUrl');

    // Limpia el estado de React
    setUser(null);
    setIsAuthenticated(false);
  };

  // Muestra un mensaje mientras se verifica la sesión inicial
  if (isLoading) {
    return <div>Verificando sesión...</div>;
  }

  // Si no está autenticado, muestra el componente Login
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Si está autenticado pero por alguna razón user es null (no debería pasar aquí)
  if (!user) {
     console.error("Error: Autenticado pero sin datos de usuario.");
     // Podrías intentar recargar o mostrar un error genérico
     handleLogout(); // Forzar logout como medida de seguridad/recuperación
     return <div>Error de estado, por favor reintente el login.</div>;
  }

  // Si está autenticado y tenemos datos de usuario, muestra MainLayout
  return (
    <MainLayout
      userName={user.name}
      userRole={user.role}
      userImageUrl={user.imageUrl}
      onLogout={handleLogout}
    />
  );
};

export default AuthController;
