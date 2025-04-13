// src/App.tsx
import React from 'react';
import './App.css';
import AuthController from './controllers/AuthController'; // Asegúrate que la ruta sea correcta

const App: React.FC = () => {
  return (
    // La clase App podría no ser necesaria si AuthController ocupa toda la pantalla
    <div className="App">
      <AuthController />
    </div>
  );
};

export default App;
