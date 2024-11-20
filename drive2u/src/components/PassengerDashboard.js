// src/components/PassengerDashboard.js

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import debounce from 'lodash.debounce';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Configuración de los iconos predeterminados de Leaflet
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

const PassengerDashboard = () => {
  const navigate = useNavigate();
  const mapRef = useRef();

  const [userName, setUserName] = useState('');
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [filters, setFilters] = useState({
    cupos: '',
    salida: '',
    llegada: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  // Estado para manejar la reserva
  const [showModal, setShowModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [reservationData, setReservationData] = useState({
    requestedPlaces: 1,
    pickup_dropPoint: [''],
  });

  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  const [showEndSuggestions, setShowEndSuggestions] = useState(false);

  const startInputRef = useRef();
  const endInputRef = useRef();

  // Manejo de clicks fuera de los inputs para cerrar las sugerencias
  const handleClickOutside = (e) => {
    if (startInputRef.current && !startInputRef.current.contains(e.target)) {
      setShowStartSuggestions(false);
    }
    if (endInputRef.current && !endInputRef.current.contains(e.target)) {
      setShowEndSuggestions(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Obtener el nombre del usuario y los viajes disponibles
  useEffect(() => {
    const fetchUserAndTrips = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Token no encontrado. Por favor, inicia sesión nuevamente.');
          navigate('/login');
          return;
        }

        // Obtener información del usuario
        const userResponse = await axios.get('https://proyecto-final-be-un-bof.vercel.app/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (userResponse && userResponse.data) {
          const { name, surName } = userResponse.data;
          setUserName(`${name} ${surName}`);
          console.log(`Nombre de usuario establecido: ${name} ${surName}`);
        } else {
          setUserName('Usuario');
          toast.warn('No se pudo obtener el nombre completo. Se mostrará un nombre genérico.');
          console.log('Nombre de usuario establecido por defecto: Usuario');
        }

        // Obtener todos los viajes disponibles
        const tripsResponse = await axios.get('https://proyecto-final-be-un-bof.vercel.app/trips', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (tripsResponse && tripsResponse.data) {
          setTrips(tripsResponse.data);
          setFilteredTrips(tripsResponse.data);
          console.log(`Número de viajes obtenidos: ${tripsResponse.data.length}`);
        } else {
          setTrips([]);
          setFilteredTrips([]);
          toast.info('No hay viajes disponibles en este momento.');
          console.log('No se obtuvieron viajes.');
        }
      } catch (error) {
        console.error('Error al obtener datos:', error);
        toast.error(`Error: ${error.response?.data?.message || 'Error al obtener datos.'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndTrips();
  }, [navigate]);

  // Filtrar los viajes basados en los filtros
  useEffect(() => {
    const applyFilters = () => {
      let updatedTrips = [...trips];

      if (filters.cupos) {
        updatedTrips = updatedTrips.filter(
          (trip) => trip.availablePlaces >= parseInt(filters.cupos, 10)
        );
      }

      if (filters.salida) {
        updatedTrips = updatedTrips.filter((trip) =>
          trip.startLocation.toLowerCase().includes(filters.salida.toLowerCase())
        );
      }

      if (filters.llegada) {
        updatedTrips = updatedTrips.filter((trip) =>
          trip.endTrip.toLowerCase().includes(filters.llegada.toLowerCase())
        );
      }

      setFilteredTrips(updatedTrips);
      console.log(`Número de viajes después de aplicar filtros: ${updatedTrips.length}`);
    };

    applyFilters();
  }, [filters, trips]);

  // Fetch de sugerencias para Punto de inicio con debounce
  const fetchStartSuggestions = debounce(async (value) => {
    if (value.length < 3) {
      setStartSuggestions([]);
      setShowStartSuggestions(false);
      return;
    }

    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: value,
          format: 'json',
          addressdetails: 1,
          limit: 5,
        },
        headers: {
          'Accept-Language': 'es',
        },
      });
      setStartSuggestions(response.data);
      setShowStartSuggestions(true);
      console.log('Start Suggestions:', response.data); // Debugging
    } catch (error) {
      console.error('Error al obtener sugerencias de inicio:', error);
    }
  }, 300);

  // Fetch de sugerencias para Punto de llegada con debounce
  const fetchEndSuggestions = debounce(async (value) => {
    if (value.length < 3) {
      setEndSuggestions([]);
      setShowEndSuggestions(false);
      return;
    }

    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: value,
          format: 'json',
          addressdetails: 1,
          limit: 5,
        },
        headers: {
          'Accept-Language': 'es',
        },
      });
      setEndSuggestions(response.data);
      setShowEndSuggestions(true);
      console.log('End Suggestions:', response.data); // Debugging
    } catch (error) {
      console.error('Error al obtener sugerencias de llegada:', error);
    }
  }, 300);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));

    // Llamar a las funciones de sugerencias según el campo
    if (name === 'salida') {
      fetchStartSuggestions(value);
    } else if (name === 'llegada') {
      fetchEndSuggestions(value);
    }
  };

  const handleSelectSuggestion = (suggestion, type) => {
    const coords = [parseFloat(suggestion.lat), parseFloat(suggestion.lon)];
    if (type === 'start') {
      setFilters((prevFilters) => ({
        ...prevFilters,
        salida: suggestion.display_name,
      }));
      setStartSuggestions([]);
      setShowStartSuggestions(false);
      if (mapRef.current) {
        mapRef.current.setView(coords, 13);
        console.log(`Mapa centrado en coordenadas de salida: ${coords}`);
      }
    } else if (type === 'end') {
      setFilters((prevFilters) => ({
        ...prevFilters,
        llegada: suggestion.display_name,
      }));
      setEndSuggestions([]);
      setShowEndSuggestions(false);
      if (mapRef.current) {
        mapRef.current.setView(coords, 13);
        console.log(`Mapa centrado en coordenadas de llegada: ${coords}`);
      }
    }
  };

  // Manejar la apertura del modal de reserva
  const handleReserveClick = (trip) => {
    setSelectedTrip(trip);
    setReservationData({
      requestedPlaces: 1,
      pickup_dropPoint: [''],
    });
    setShowModal(true);
    console.log(`Abrir modal de reserva para el viaje ID: ${trip.id}`);
  };

  // Manejar cambios en el formulario de reserva
  const handleReservationChange = (e) => {
    const { name, value } = e.target;
    setReservationData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Manejar cambios en pickup_dropPoint
  const handlePickupDropChange = (index, value) => {
    const updatedPoints = [...reservationData.pickup_dropPoint];
    updatedPoints[index] = value;
    setReservationData((prevData) => ({
      ...prevData,
      pickup_dropPoint: updatedPoints,
    }));
  };

  // Agregar un nuevo campo de pickup_dropPoint
  const addPickupDropPoint = () => {
    setReservationData((prevData) => ({
      ...prevData,
      pickup_dropPoint: [...prevData.pickup_dropPoint, ''],
    }));
  };

  // Eliminar un campo de pickup_dropPoint
  const removePickupDropPoint = (index) => {
    const updatedPoints = [...reservationData.pickup_dropPoint];
    updatedPoints.splice(index, 1);
    setReservationData((prevData) => ({
      ...prevData,
      pickup_dropPoint: updatedPoints,
    }));
  };

  // Manejar la reserva de un viaje
  const handleReserveSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (
      !reservationData.requestedPlaces ||
      reservationData.requestedPlaces < 1 ||
      reservationData.requestedPlaces > selectedTrip.availablePlaces
    ) {
      toast.error('Número de cupos solicitados no válido.');
      console.log('Validación de cupos fallida.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Token no encontrado. Por favor, inicia sesión nuevamente.');
        navigate('/login');
        return;
      }

      const reservePayload = {
        requestedPlaces: parseInt(reservationData.requestedPlaces, 10),
        pickup_dropPoint: reservationData.pickup_dropPoint,
      };

      const response = await axios.post(
        `https://proyecto-final-be-un-bof.vercel.app/trips/${selectedTrip.id}/reserve`,
        reservePayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 201) {
        toast.success('¡Reserva realizada exitosamente!');
        setShowModal(false);
        console.log(`Reserva exitosa para el viaje ID: ${selectedTrip.id}`);

        // Actualizar los cupos disponibles en el estado local
        setTrips((prevTrips) =>
          prevTrips.map((trip) =>
            trip.id === selectedTrip.id
              ? { ...trip, availablePlaces: trip.availablePlaces - reservationData.requestedPlaces }
              : trip
          )
        );
        setFilteredTrips((prevTrips) =>
          prevTrips.map((trip) =>
            trip.id === selectedTrip.id
              ? { ...trip, availablePlaces: trip.availablePlaces - reservationData.requestedPlaces }
              : trip
          )
        );
      } else {
        throw new Error('Error desconocido al realizar la reserva.');
      }
    } catch (error) {
      console.error('Error al reservar el viaje:', error);
      toast.error(`Error: ${error.response?.data?.message || 'Error al reservar el viaje.'}`);
    }
  };

  // Verificación de coordenadas válidas
  useEffect(() => {
    filteredTrips.forEach((trip) => {
      if (!trip.startLocationCoords || trip.startLocationCoords.length !== 2) {
        console.warn(`Trip ID: ${trip.id} tiene coordenadas inválidas. Se usará la ubicación por defecto.`);
      }
    });
  }, [filteredTrips]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <ToastContainer />
      {/* Header */}
      <header className="flex-shrink-0 flex justify-between items-center p-4 bg-white shadow">
        <h1 className="text-2xl font-bold">Bienvenido, {userName}</h1>
      </header>

      <div className="flex flex-1">
        {/* Contenedor del Mapa */}
        <div className="flex-1 h-full">
          <MapContainer
            center={[4.7110, -74.0721]}
            zoom={12}
            className="w-full h-full"
            whenCreated={(mapInstance) => {
              mapRef.current = mapInstance;
              // Asegurar que el mapa se ajusta correctamente
              mapInstance.invalidateSize();
              console.log('Mapa creado y tamaño invalidado.');
            }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {filteredTrips.map((trip) => (
              <Marker
                key={trip.id}
                position={
                  trip.startLocationCoords && trip.startLocationCoords.length === 2
                    ? trip.startLocationCoords
                    : [4.7110, -74.0721] // Coordenadas por defecto si no son válidas
                }
                icon={defaultIcon}
              >
                <Popup>
                  <div>
                    <h3 className="font-semibold">{trip.startLocation} → {trip.endTrip}</h3>
                    <p><strong>Hora de salida:</strong> {trip.timeTrip}</p>
                    <p><strong>Cupos disponibles:</strong> {trip.availablePlaces}</p>
                    <p><strong>Tarifa por pasajero:</strong> ${trip.priceTrip}</p>
                    {trip.route && <p><strong>Ruta:</strong> {trip.route}</p>}
                    <button
                      onClick={() => handleReserveClick(trip)}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300"
                    >
                      Reservar
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Barra de Filtros y Lista de Viajes */}
        <div className="w-full md:w-1/3 p-6 bg-white border-l border-gray-300 overflow-auto">
          <h2 className="text-2xl font-bold mb-4">Viajes Disponibles:</h2>
          <h3 className="text-lg mb-2">Filtros</h3>
          <div className="space-y-4 mb-6">
            <input
              type="number"
              name="cupos"
              value={filters.cupos}
              onChange={handleFilterChange}
              placeholder="Número de cupos"
              className="w-full p-2 border border-gray-300 rounded"
              min="1"
            />
            <div className="relative" ref={startInputRef}>
              <input
                type="text"
                name="salida"
                value={filters.salida}
                onChange={handleFilterChange}
                onFocus={() => {
                  if (startSuggestions.length > 0) setShowStartSuggestions(true);
                }}
                placeholder="Punto de salida"
                className="w-full p-2 border border-gray-300 rounded"
              />
              {showStartSuggestions && startSuggestions.length > 0 && (
                <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded mt-1 max-h-40 overflow-y-auto shadow-lg">
                  {startSuggestions.map((suggestion) => (
                    <li
                      key={suggestion.place_id}
                      onClick={() => handleSelectSuggestion(suggestion, 'start')}
                      className="p-2 hover:bg-blue-100 cursor-pointer"
                    >
                      {suggestion.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="relative" ref={endInputRef}>
              <input
                type="text"
                name="llegada"
                value={filters.llegada}
                onChange={handleFilterChange}
                onFocus={() => {
                  if (endSuggestions.length > 0) setShowEndSuggestions(true);
                }}
                placeholder="Punto de llegada"
                className="w-full p-2 border border-gray-300 rounded"
              />
              {showEndSuggestions && endSuggestions.length > 0 && (
                <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded mt-1 max-h-40 overflow-y-auto shadow-lg">
                  {endSuggestions.map((suggestion) => (
                    <li
                      key={suggestion.place_id}
                      onClick={() => handleSelectSuggestion(suggestion, 'end')}
                      className="p-2 hover:bg-blue-100 cursor-pointer"
                    >
                      {suggestion.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              className="w-full p-2 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 transition duration-300"
              onClick={() => {
                // Los filtros ya se aplican en tiempo real mediante useEffect
                console.log('Filtros aplicados.');
              }}
            >
              Aplicar Filtros
            </button>
          </div>

          {/* Lista de viajes filtrados */}
          <div>
            {isLoading ? (
              <p>Cargando viajes...</p>
            ) : filteredTrips.length === 0 ? (
              <p>No se encontraron viajes con los filtros aplicados.</p>
            ) : (
              <ul className="space-y-4">
                {filteredTrips.map((trip) => (
                  <li key={trip.id} className="p-4 border border-gray-300 rounded shadow">
                    <h3 className="text-xl font-semibold mb-2">{trip.startLocation} → {trip.endTrip}</h3>
                    <p><strong>Hora de salida:</strong> {trip.timeTrip}</p>
                    <p><strong>Cupos disponibles:</strong> {trip.availablePlaces}</p>
                    <p><strong>Tarifa por pasajero:</strong> ${trip.priceTrip}</p>
                    {trip.route && <p><strong>Ruta:</strong> {trip.route}</p>}
                    <button
                      onClick={() => handleReserveClick(trip)}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300"
                    >
                      Reservar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Reserva */}
      {showModal && selectedTrip && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-11/12 md:w-1/3">
            <h2 className="text-2xl font-bold mb-4">Reservar Viaje</h2>
            <form onSubmit={handleReserveSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">Número de Cupos:</label>
                <input
                  type="number"
                  name="requestedPlaces"
                  value={reservationData.requestedPlaces}
                  onChange={handleReservationChange}
                  min="1"
                  max={selectedTrip.availablePlaces}
                  required
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              {/* Campos dinámicos para pickup_dropPoint */}
              <div>
                <label className="block font-semibold mb-1">Puntos de Origen/Destino:</label>
                {reservationData.pickup_dropPoint.map((point, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <input
                      type="text"
                      value={point}
                      onChange={(e) => handlePickupDropChange(index, e.target.value)}
                      placeholder={`Punto ${index + 1}`}
                      required
                      className="flex-1 p-2 border border-gray-300 rounded"
                    />
                    {reservationData.pickup_dropPoint.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePickupDropPoint(index)}
                        className="ml-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition duration-300"
                      >
                        -
                      </button>
                    )}
                  </div>
                ))}
                {reservationData.pickup_dropPoint.length < reservationData.requestedPlaces && (
                  <button
                    type="button"
                    onClick={addPickupDropPoint}
                    className="mt-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition duration-300"
                  >
                    + Agregar Punto
                  </button>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition duration-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300"
                >
                  Reservar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengerDashboard;