import React, { useState, useEffect } from 'react';
import DriverDashboard from './DriverDashboard';
import PassengerDashboard from './PassengerDashboard';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCog } from 'react-icons/fa'; // Asegúrate de tener react-icons instalado
import Modal from 'react-modal';
import axios from 'axios';
import { Switch } from '@mui/material'; // Asegúrate de tener @mui/material instalado
import ModifyUser from './ModifyUser'; // Verifica que la ruta sea correcta

// Configuración de React Modal
Modal.setAppElement('#root'); // Asegúrate de que en tu index.html exista un elemento con id 'root'

const MainDashboard = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState(null); // Estado para almacenar el rol del usuario
  const [isDriverView, setIsDriverView] = useState(true); // Estado para controlar la vista del conductor/pasajero
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar el modal
  const [isLoading, setIsLoading] = useState(true); // Estado para manejar la carga de datos

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Token no encontrado. Por favor, inicia sesión nuevamente.');
          navigate('/login');
          return;
        }

        // Obtener el rol del usuario desde el backend
        const response = await axios.get('https://proyecto-final-be-un-bof.vercel.app/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data && response.data.userType) {
          setRole(response.data.userType); // Establecer el rol del usuario
        } else {
          toast.error('Error al obtener el rol del usuario. Inicia sesión nuevamente.');
          navigate('/login');
        }
      } catch (error) {
        console.error('Error al obtener el rol del usuario:', error);
        toast.error('No se pudo obtener tu información. Por favor, inicia sesión nuevamente.');
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Cerraste sesión exitosamente');
    navigate('/login');
  };

  const openSettings = () => {
    setIsModalOpen(true);
  };

  const closeSettings = () => {
    setIsModalOpen(false);
  };

  const handleToggle = () => {
    setIsDriverView((prev) => !prev); // Cambiar entre vista de conductor y pasajero
  };

  if (isLoading) {
    return <div>Cargando...</div>; // Mostrar un indicador de carga mientras se obtiene el rol
  }

  if (!role) {
    return <div>No se pudo determinar el rol del usuario. Por favor, intenta nuevamente.</div>;
  }

  return (
    <div>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #ddd',
        }}
      >
        <h1
          style={{
            fontWeight: 'bolder',
            fontSize: '1.5rem',
          }}
        >
          Drive 2 U
        </h1>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {role === 'driver' && (
            <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
              <label style={{ marginRight: '10px', fontWeight: 'bold' }}>
                {isDriverView ? 'Conductor' : 'Pasajero'}
              </label>
              <Switch
                checked={isDriverView}
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
            </div>
          )}
          {/* Botón de Configuración con ícono de engranaje */}
          <button
            onClick={openSettings}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#555',
              fontSize: '1.5rem',
              marginLeft: '20px',
            }}
            title="Configuración"
          >
            <FaCog />
          </button>
          {/* Botón de Cerrar Sesión */}
          <button
            style={{
              backgroundColor: 'red',
              color: 'white',
              marginLeft: '20px',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
            onClick={handleLogout}
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Renderiza el dashboard basado en el rol y la vista seleccionada */}
      {role === 'driver' && isDriverView && <DriverDashboard />}
      {role === 'driver' && !isDriverView && <PassengerDashboard />}
      {role === 'passenger' && <PassengerDashboard />}

      {/* Modal de Configuración */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeSettings}
        contentLabel="Configuración de Usuario"
        className="modal-content bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto mt-20"
        overlayClassName="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Configuración de Usuario</h2>
          <button onClick={closeSettings} className="text-xl font-bold">
            &times;
          </button>
        </div>
        <ModifyUser closeModal={closeSettings} />
      </Modal>
    </div>
  );
};

export default MainDashboard;
