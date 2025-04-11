// src/App.tsx
import React from 'react';
import './App.css';
import AuthController from './controllers/AuthController';

const App: React.FC = () => {
  return (
    <div className="App">
      <AuthController />
    </div>
  );
};

export default App;

