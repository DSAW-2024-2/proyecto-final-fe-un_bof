// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [filters, setFilters] = useState({
    cupos: '',
    salida: '',
    llegada: ''
  });

  useEffect(() => {
    // Obtener el nombre del usuario desde la API
    const fetchUserName = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://proyecto-final-be-un-bof.vercel.app/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserName(response.data.name + ' ' + response.data.surName);
        console.log('Nombre del usuario:', response.data.name + ' ' + response.data.surName);
      } catch (error) {
        console.error('Error al obtener el nombre del usuario:', error);
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
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">

      <div className="flex flex-1">
        {/* Contenedor del Mapa */}
        <div className="flex-1">
          <MapContainer center={[4.7110, -74.0721]} zoom={12} className="w-full h-full">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
          </MapContainer>
        </div>

        {/* Barra de Filtros en el lado derecho */}
        <div className="w-1/3 p-6 bg-white border-l border-gray-300">
          <h2 className="text-2xl font-bold mb-4">Viajes Disponibles:</h2>
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
      </div>
    </div>
  );
}

export default Dashboard;