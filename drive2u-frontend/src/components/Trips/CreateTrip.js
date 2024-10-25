// src/components/Trips/CreateTrip.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateTrip = () => {
  const navigate = useNavigate();
  
  const [tripData, setTripData] = useState({
    startPoint: '',
    endPoint: '',
    route: '',
    departureTime: '',
    availableSeats: '',
    fare: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTripData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post('http://localhost:5001/api/trips', tripData, { withCredentials: true });
      alert('Viaje creado exitosamente');
      navigate('/driver/dashboard');
    } catch (error) {
      console.error('Error al crear el viaje:', error);
      alert('Error al crear el viaje');
    }
  };

  return (
    <div>
      <h2>Crear Viaje</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="startPoint" placeholder="Punto de Inicio" onChange={handleChange} required />
        <input type="text" name="endPoint" placeholder="Punto Final" onChange={handleChange} required />
        <input type="text" name="route" placeholder="Ruta" onChange={handleChange} required />
        <input type="datetime-local" name="departureTime" placeholder="Hora de Salida" onChange={handleChange} required />
        <input type="number" name="availableSeats" placeholder="Cantidad de Puestos Disponibles" onChange={handleChange} required />
        <input type="number" step="0.01" name="fare" placeholder="Tarifa por Pasajero" onChange={handleChange} required />
        <button type="submit">Crear Viaje</button>
      </form>
    </div>
  );
};

export default CreateTrip;
