// src/components/Dashboard/DriverDashboard.js
import React from 'react';
import { Link } from 'react-router-dom';

const DriverDashboard = () => {
  return (
    <div>
      <h2>Dashboard del Conductor</h2>
      <Link to="/trips/create">Crear Viaje</Link>
      {/* Lista de viajes creados por el conductor */}
      {/* Implementa según tus necesidades */}
    </div>
  );
};

export default DriverDashboard;
