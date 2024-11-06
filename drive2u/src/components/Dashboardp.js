// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import 'react-toastify/dist/ReactToastify.css';

function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [filters, setFilters] = useState({
    cupos: '',
    salida: '',
    llegada: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Función para obtener el nombre del usuario desde la API
    const fetchUserName = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          setError('Token no encontrado. Por favor, inicia sesión nuevamente.');
          setLoading(false);
          return;
        }

        const response = await axios.get('https://proyecto-final-be-un-bof.vercel.app/user', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Verificar que la respuesta contiene los campos 'name' y 'surName'
        if (response.data && response.data.name && response.data.surName) {
          setUserName(`${response.data.name} ${response.data.surName}`);
        } else {
          setError('Nombre de usuario no encontrado en la respuesta de la API.');
        }
      } catch (error) {
        console.error('Error al obtener el nombre del usuario:', error);
        setError('Error al obtener los datos del usuario. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserName();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Cerraste sesión exitosamente');
    navigate('/login');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value
    }));
  };

  const applyFilters = () => {
    // Lógica para aplicar los filtros y buscar viajes
    console.log('Filtros aplicados:', filters);
    toast.info('Filtros aplicados (lógica aún por implementar)');
  };

  // Componente para la Barra de Filtros (Sidebar)
  const Sidebar = () => (
    <div className="w-full md:w-1/3 p-6 bg-white border-l border-gray-300">
      <h2 className="text-2xl font-bold mb-4">Viajes Disponibles</h2>
      <h3 className="text-lg mb-2">Filtros</h3>
      <div className="space-y-4">
        <input
          type="number"
          name="cupos"
          value={filters.cupos}
          onChange={handleChange}
          placeholder="Número de cupos"
          className="w-full p-2 border border-gray-300 rounded"
        />
        <input
          type="text"
          name="salida"
          value={filters.salida}
          onChange={handleChange}
          placeholder="Punto de salida"
          className="w-full p-2 border border-gray-300 rounded"
        />
        <input
          type="text"
          name="llegada"
          value={filters.llegada}
          onChange={handleChange}
          placeholder="Punto de llegada"
          className="w-full p-2 border border-gray-300 rounded"
        />
        <button
          onClick={applyFilters}
          className="w-full p-2 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 transition duration-300"
        >
          Aplicar Filtros
        </button>
      </div>
    </div>
  );

  // Componente para el Mapa
  const Map = () => (
    <div className="flex-1">
      <MapContainer center={[4.7110, -74.0721]} zoom={12} className="w-full h-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
      </MapContainer>
    </div>
  );

  // Componente para el Encabezado (Header)
  const Header = () => (
    <header className="flex flex-col md:flex-row items-center justify-between p-4 bg-white shadow">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Drive 2 U</h1>
        {userName && (
          <p className="text-sm text-gray-600">{userName}</p>
        )}
      </div>
      <button
        onClick={handleLogout}
        className="mt-4 md:mt-0 px-4 py-2 font-semibold text-white bg-red-600 rounded hover:bg-red-700 transition duration-300"
      >
        Cerrar Sesión
      </button>
    </header>
  );

  // Mostrar un indicador de carga mientras se obtienen los datos del usuario
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Cargando...</p>
      </div>
    );
  }

  // Mostrar un mensaje de error si ocurre algún problema al obtener los datos del usuario
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-100">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Encabezado */}
      <Header />

      {/* Contenido Principal: Mapa y Barra de Filtros */}
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Contenedor del Mapa */}
        <div className="flex-1">
          <Map />
        </div>

        {/* Barra de Filtros a la Derecha */}
        <Sidebar />
      </div>

      {/* Contenedor para los Toasts */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
}

export default Dashboard;
