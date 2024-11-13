// src/components/DriverDashboard.js
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

const DriverDashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [tripData, setTripData] = useState({
    startLocation: '', // Renombrado de startTrip a startLocation
    endTrip: '',
    timeTrip: '',
    availablePlaces: '',
    priceTrip: '',
    route: '',
  });

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('Token no encontrado en localStorage');
          return;
        }

        const response = await axios.get('https://proyecto-final-be-un-bof.vercel.app/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserName(response.data.name + ' ' + response.data.surName);
      } catch (error) {
        console.error('Error al obtener el nombre del usuario:', error.message);
        console.error('Detalles del error:', error);
      }
    };

    fetchUserName();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTripData({ ...tripData, [name]: value });
  };

  const handleRegisterTrip = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'https://proyecto-final-be-un-bof.vercel.app/trip/create',
        tripData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      alert(`Viaje registrado con éxito con ID: ${response.data.tripId}`);
      setTripData({
        startLocation: '', // Renombrado de startTrip a startLocation
        endTrip: '',
        timeTrip: '',
        availablePlaces: '',
        priceTrip: '',
        route: '',
      });
    } catch (error) {
      console.log('Error al registrar el viaje: ', error);
    }
  };

  return (
    <div className="flex flex-row h-screen bg-gray-100 overflow-hidden">
      {/* Contenedor del Mapa */}
      <div className="flex-1">
        <MapContainer center={[4.80923, -74.05701]} zoom={13} className="w-full h-full">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={[4.80923, -74.05701]}>
            <Popup>Universidad de la Sabana</Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Formulario de Registro de Viaje */}
      <div className="w-full flex-1 p-6 bg-white border-l border-gray-300 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Registrar un viaje:</h2>
        </div>
        <form onSubmit={handleRegisterTrip} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Punto de inicio:</label>
            <input
              type="text"
              name="startLocation" // Renombrado de startTrip a startLocation
              value={tripData.startLocation}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Punto de llegada:</label>
            <input
              type="text"
              name="endTrip"
              value={tripData.endTrip}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Hora de Salida:</label>
            <input
              type="time"
              name="timeTrip"
              value={tripData.timeTrip}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Cupos:</label>
            <select
              name="availablePlaces"
              value={tripData.availablePlaces}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            >
              <option value="">Selecciona una opción</option> {/* Añadido valor por defecto */}
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Tarifa por pasajero:</label>
            <input
              type="number"
              name="priceTrip"
              value={tripData.priceTrip}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
              min="0"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Ruta: (Opcional)</label>
            <input
              type="text"
              name="route"
              value={tripData.route}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <button
            type="submit"
            className="w-full p-2 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 transition duration-300"
          >
            Registrar Viaje
          </button>
        </form>
      </div>
    </div>
  );
};

export default DriverDashboard;