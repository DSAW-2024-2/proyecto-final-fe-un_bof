// src/components/MainDashboard.js
import React, { useState } from 'react';
import DriverDashboard from './DriverDashboard';
import PassengerDashboard from './PassengerDashboard';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Switch } from '@mui/material'; // Importa el componente Switch

const MainDashboard = () => {
  const navigate = useNavigate();
  const [isDriver, setIsDriver] = useState(true);

  const handleToggle = () => {
    setIsDriver((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Cerraste sesión exitosamente');
    navigate('/login');
  };

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
        <h1
          style={{
            fontWeight: 'bolder',
            fontSize: '1.5rem'
          }}
        >
          Drive 2 U
        </h1>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label style={{ marginRight: '10px' }}>{isDriver ? 'Conductor' : 'Pasajero'}</label>
          {/* Deslizador verde */}
          <Switch
            checked={isDriver}
            onChange={handleToggle}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: 'green',
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: 'green',
              },
            }}
          />
          <button
            style={{
              backgroundColor: 'red',
              color: 'white',
              marginLeft: '20px',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
            }}
            onClick={handleLogout}
          >
            Cerrar Sesión
          </button>
        </div>
      </header>
      
      {/* Renderiza el dashboard de conductor o pasajero basado en el estado */}
      {isDriver ? <DriverDashboard /> : <PassengerDashboard />}
    </div>
  );
};

export default MainDashboard;
