// src/controllers/AuthController.tsx
import React, { useState } from 'react';
import Login from '../components/Login';
import Dashboard from '../views/Dashboard';

const AuthController: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <>
      {isAuthenticated ? <Dashboard /> : <Login onLoginSuccess={handleLoginSuccess} />}
    </>
  );
};

export default AuthController;
