// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import MainDashboard from './components/MainDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta raíz redirige a /login */}
        <Route path="/" element={<Login />} />

        {/* Ruta de Registro */}
        <Route path="/register" element={<Register />} />

        {/* Ruta del Dashboard protegida */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainDashboard /> {/* Cambiado para usar MainDashboard */}
            </ProtectedRoute>
          }
        />

        {/* Ruta no encontrada (404) - Opcional */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
