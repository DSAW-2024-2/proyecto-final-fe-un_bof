// src/components/Trips/TripList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TripList = () => {
  const [trips, setTrips] = useState([]);
  const [filters, setFilters] = useState({
    availableSeats: '',
    startPoint: '',
  });

  const fetchTrips = async () => {
    try {
      const params = {};
      if (filters.availableSeats) params.availableSeats = filters.availableSeats;
      if (filters.startPoint) params.startPoint = filters.startPoint;

      const response = await axios.get('http://localhost:5000/api/trips', { params, withCredentials: true });
      setTrips(response.data);
    } catch (error) {
      console.error('Error al obtener los viajes:', error);
      alert('Error al obtener los viajes');
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    fetchTrips();
  };

  return (
    <div>
      <h2>Listado de Viajes Disponibles</h2>
      <div>
        <input type="number" name="availableSeats" placeholder="Cantidad de Puestos Disponibles" onChange={handleFilterChange} />
        <input type="text" name="startPoint" placeholder="Punto de Salida" onChange={handleFilterChange} />
        <button onClick={handleSearch}>Buscar</button>
      </div>
      <ul>
        {trips.map(trip => (
          <li key={trip.id}>
            <p><strong>Inicio:</strong> {trip.startPoint}</p>
            <p><strong>Final:</strong> {trip.endPoint}</p>
            <p><strong>Ruta:</strong> {trip.route}</p>
            <p><strong>Hora de Salida:</strong> {new Date(trip.departureTime.seconds * 1000).toLocaleString()}</p>
            <p><strong>Cupos Disponibles:</strong> {trip.availableSeats}</p>
            <p><strong>Tarifa por Pasajero:</strong> ${trip.fare}</p>
            <button onClick={() => {/* Implementa la reserva */}}>Reservar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TripList;
