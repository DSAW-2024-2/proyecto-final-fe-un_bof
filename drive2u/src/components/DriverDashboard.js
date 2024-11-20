import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import debounce from 'lodash.debounce';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Iconos personalizados para los marcadores
const greenIcon = new L.Icon({
  iconUrl: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
  iconSize: [32, 32],
});

const redIcon = new L.Icon({
  iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
  iconSize: [32, 32],
});

// Componente para mostrar la información del viaje registrado
const TripBanner = ({ trip, onDelete, onEdit }) => (
  <div className="mt-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
    <h3 className="text-xl font-semibold mb-2">Información del Viaje Registrado</h3>
    <p><strong>Punto de inicio:</strong> {trip.startLocation}</p>
    <p><strong>Punto de llegada:</strong> {trip.endTrip}</p>
    <p><strong>Hora de salida:</strong> {trip.timeTrip}</p>
    <p><strong>Cupos disponibles:</strong> {trip.availablePlaces}</p>
    <p><strong>Tarifa por pasajero:</strong> ${trip.priceTrip}</p>
    {trip.route && <p><strong>Ruta:</strong> {trip.route}</p>}
    <div className="flex space-x-4 mt-4">
      <button
        onClick={() => onDelete(trip.id)}
        className="w-full p-2 font-semibold text-white bg-red-600 rounded hover:bg-red-700"
      >
        Eliminar Viaje
      </button>
      <button
        onClick={() => onEdit(trip)}
        className="w-full p-2 font-semibold text-black bg-yellow-500 rounded hover:bg-yellow-600"
      >
        Editar Viaje
      </button>
    </div>
  </div>
);

const DriverDashboard = () => {
  const navigate = useNavigate();
  const mapRef = useRef();

  const [userName, setUserName] = useState('');
  const [tripData, setTripData] = useState({
    startLocation: '',
    endTrip: '',
    timeTrip: '',
    availablePlaces: '',
    priceTrip: '',
    route: '',
  });
  const [startCoords, setStartCoords] = useState([4.80923, -74.05701]);
  const [endCoords, setEndCoords] = useState(null);
  const [registeredTrip, setRegisteredTrip] = useState(null);
  const [hasActiveTrip, setHasActiveTrip] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  const [showEndSuggestions, setShowEndSuggestions] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Estado para manejar edición
  const [editTripId, setEditTripId] = useState(null); // ID del viaje a editar

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

  useEffect(() => {
    const fetchUserNameAndTrips = async () => {
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

          if (name && surName) {
            setUserName(`${name} ${surName}`);
          } else {
            setUserName('Usuario');
            toast.warn('No se pudo obtener el nombre completo. Se mostrará un nombre genérico.');
          }
        } else {
          throw new Error('La respuesta de la API no contiene datos válidos.');
        }

        // Obtener viaje activo
        const tripResponse = await axios.get('https://proyecto-final-be-un-bof.vercel.app/trips/mytrip', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (tripResponse.data && tripResponse.data.activeTrip) {
          setHasActiveTrip(true);
          setRegisteredTrip(tripResponse.data.activeTrip);
          setStartCoords(tripResponse.data.activeTrip.startLocationCoords || [4.80923, -74.05701]);
          setEndCoords(tripResponse.data.activeTrip.endTripCoords || [4.71099, -74.07209]);

          if (tripResponse.data.activeTrip.startLocationCoords && mapRef.current) {
            mapRef.current.setView(tripResponse.data.activeTrip.startLocationCoords, 13);
          }
        } else {
          setHasActiveTrip(false);
          setRegisteredTrip(null);
          setStartCoords([4.80923, -74.05701]);
          setEndCoords(null);
        }
      } catch (error) {
        if (error.response) {
          if (error.response.status === 404 && error.response.data.message === 'No tienes ningún viaje creado.') {
            // Situación esperada: no hay viajes activos
            setHasActiveTrip(false);
            setRegisteredTrip(null);
            setStartCoords([4.80923, -74.05701]);
            setEndCoords(null);
          } else {
            toast.error(`Error: ${error.response.data.message || 'Error al obtener tu información o viajes.'}`);
          }
        } else if (error.request) {
          toast.error('No se recibió respuesta del servidor. Intenta nuevamente más tarde.');
        } else {
          toast.error(`Error: ${error.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserNameAndTrips();
  }, [navigate]);

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
          limit: 5, // Aumentar el límite para más sugerencias
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
          limit: 5, // Aumentar el límite para más sugerencias
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'startLocation') {
      fetchStartSuggestions(value);
    } else if (name === 'endTrip') {
      fetchEndSuggestions(value);
    }

    setTripData({ ...tripData, [name]: value });
  };

  const handleSelectSuggestion = (suggestion, type) => {
    const coords = [parseFloat(suggestion.lat), parseFloat(suggestion.lon)];
    if (type === 'start') {
      setTripData({
        ...tripData,
        startLocation: suggestion.display_name,
      });
      setStartCoords(coords);
      setStartSuggestions([]);
      setShowStartSuggestions(false);
      if (mapRef.current) {
        mapRef.current.setView(coords, 13);
      }
    } else if (type === 'end') {
      setTripData({
        ...tripData,
        endTrip: suggestion.display_name,
      });
      setEndCoords(coords);
      setEndSuggestions([]);
      setShowEndSuggestions(false);
      if (mapRef.current) {
        mapRef.current.setView(coords, 13);
      }
    }
  };

  const handleRegisterTrip = async (e) => {
    e.preventDefault();
    if (hasActiveTrip && !isEditing) {
      toast.error('Ya tienes un viaje activo. Debes eliminarlo antes de crear uno nuevo.');
      return;
    }

    // Validaciones adicionales
    if (!tripData.startLocation || !tripData.endTrip) {
      toast.error('Por favor, selecciona tanto el punto de inicio como el de llegada.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Token no encontrado. Por favor, inicia sesión nuevamente.');
        navigate('/login');
        return;
      }

      const tripPayload = {
        ...tripData,
        startLocationCoords: startCoords,
        endTripCoords: endCoords,
      };

      let response;
      if (isEditing && editTripId) {
        // Si está en modo edición, realiza una solicitud PUT
        response = await axios.put(
          `https://proyecto-final-be-un-bof.vercel.app/trips/${editTripId}`, // URL ajustada según tu backend
          tripPayload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
      } else {
        // Si no está editando, crea un nuevo viaje
        response = await axios.post(
          'https://proyecto-final-be-un-bof.vercel.app/trip/create', // Asegúrate de que la URL sea correcta
          tripPayload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      if (response.status === 200 || response.status === 201) {
        if (isEditing) {
          toast.success('¡Viaje actualizado con éxito!');
          setRegisteredTrip({ ...tripData, id: editTripId });
          setIsEditing(false);
          setEditTripId(null);
        } else {
          toast.success('¡Viaje registrado con éxito!');
          const { tripId } = response.data;
          setRegisteredTrip({ ...tripData, id: tripId });
          setHasActiveTrip(true);
        }
        setTripData({
          startLocation: '',
          endTrip: '',
          timeTrip: '',
          availablePlaces: '',
          priceTrip: '',
          route: '',
        });
        setStartCoords([4.80923, -74.05701]);
        setEndCoords(null);
        if (mapRef.current) {
          mapRef.current.setView([4.80923, -74.05701], 13);
        }
      } else {
        throw new Error('Error desconocido al registrar o actualizar el viaje.');
      }
    } catch (error) {
      if (error.response) {
        toast.error(`Error: ${error.response.data.message || 'Error al registrar o actualizar el viaje.'}`);
      } else if (error.request) {
        toast.error('No se recibió respuesta del servidor. Intenta nuevamente más tarde.');
      } else {
        toast.error(`Error: ${error.message}`);
      }
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este viaje?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Token no encontrado. Por favor, inicia sesión nuevamente.');
        navigate('/login');
        return;
      }

      const response = await axios.delete(
        `https://proyecto-final-be-un-bof.vercel.app/trips/${tripId}`, // Asegúrate de que la URL sea correcta
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success('¡Viaje eliminado exitosamente!');
        setRegisteredTrip(null);
        setHasActiveTrip(false);
        setTripData({
          startLocation: '',
          endTrip: '',
          timeTrip: '',
          availablePlaces: '',
          priceTrip: '',
          route: '',
        });
        setStartCoords([4.80923, -74.05701]);
        setEndCoords(null);
        if (mapRef.current) {
          mapRef.current.setView([4.80923, -74.05701], 13);
        }
      } else {
        throw new Error('Error desconocido al eliminar el viaje.');
      }
    } catch (error) {
      if (error.response) {
        toast.error(`Error: ${error.response.data.message || 'Error al eliminar el viaje.'}`);
      } else if (error.request) {
        toast.error('No se recibió respuesta del servidor. Intenta nuevamente más tarde.');
      } else {
        toast.error(`Error: ${error.message}`);
      }
    }
  };

  const handleEditTrip = (trip) => {
    setIsEditing(true);
    setEditTripId(trip.id);
    setTripData({
      startLocation: trip.startLocation,
      endTrip: trip.endTrip,
      timeTrip: trip.timeTrip,
      availablePlaces: trip.availablePlaces,
      priceTrip: trip.priceTrip,
      route: trip.route || '',
    });
    setStartCoords(trip.startLocationCoords || [4.80923, -74.05701]);
    setEndCoords(trip.endTripCoords || [4.71099, -74.07209]);
    if (mapRef.current && trip.startLocationCoords) {
      mapRef.current.setView(trip.startLocationCoords, 13);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTripId(null);
    setTripData({
      startLocation: '',
      endTrip: '',
      timeTrip: '',
      availablePlaces: '',
      priceTrip: '',
      route: '',
    });
    setStartCoords([4.80923, -74.05701]);
    setEndCoords(null);
    if (mapRef.current) {
      mapRef.current.setView([4.80923, -74.05701], 13);
    }
  };

  const handleRegisterCoords = () => {
    if (startCoords && endCoords) {
      if (mapRef.current) {
        const map = mapRef.current;
        const bounds = L.latLngBounds([startCoords, endCoords]);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  };

  useEffect(() => {
    handleRegisterCoords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startCoords, endCoords]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <ToastContainer />
      <div className="flex flex-col md:flex-row flex-1">
        {/* Mapa */}
        <div className="w-full md:w-3/5 h-1/2 md:h-full relative">
          <MapContainer
            center={startCoords}
            zoom={13}
            className="w-full h-full"
            whenCreated={(mapInstance) => { mapRef.current = mapInstance; }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {startCoords && (
              <Marker position={startCoords} icon={greenIcon}>
                <Popup>{tripData.startLocation || 'Punto de inicio'}</Popup>
              </Marker>
            )}
            {endCoords && (
              <Marker position={endCoords} icon={redIcon}>
                <Popup>{tripData.endTrip || 'Punto de llegada'}</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        {/* Formulario */}
        <div className="w-full md:w-2/5 h-1/2 md:h-full p-6 bg-white border-t md:border-l border-gray-300 overflow-auto relative">
          <h2 className="text-2xl font-bold mb-4">Registrar un viaje:</h2>
          <div className="mb-6 text-lg font-medium">
            {isLoading ? 'Cargando...' : `Bienvenido, ${userName}`}
          </div>

          {hasActiveTrip && registeredTrip && (
            <TripBanner trip={registeredTrip} onDelete={handleDeleteTrip} onEdit={handleEditTrip} />
          )}

          {/* Mostrar formulario de edición si está en modo edición */}
          {isEditing && (
            <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
              <h3 className="text-xl font-semibold mb-2">Editar Viaje</h3>
              <form onSubmit={handleRegisterTrip} className="space-y-4 mt-4">
                {/* Punto de inicio */}
                <div className="relative" ref={startInputRef}>
                  <label className="block font-semibold mb-1">Punto de inicio:</label>
                  <input
                    type="text"
                    name="startLocation"
                    value={tripData.startLocation}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingrese el punto de inicio"
                    required
                    onFocus={() => {
                      if (startSuggestions.length > 0) setShowStartSuggestions(true);
                    }}
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

                {/* Punto de llegada */}
                <div className="relative" ref={endInputRef}>
                  <label className="block font-semibold mb-1">Punto de llegada:</label>
                  <input
                    type="text"
                    name="endTrip"
                    value={tripData.endTrip}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingrese el punto de llegada"
                    required
                    onFocus={() => {
                      if (endSuggestions.length > 0) setShowEndSuggestions(true);
                    }}
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

                {/* Hora de salida */}
                <div>
                  <label className="block font-semibold mb-1">Hora de salida:</label>
                  <input
                    type="time"
                    name="timeTrip"
                    value={tripData.timeTrip}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Cupos */}
                <div>
                  <label className="block font-semibold mb-1">Cupos:</label>
                  <input
                    type="number"
                    name="availablePlaces"
                    value={tripData.availablePlaces}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="1"
                    max="4"
                  />
                </div>

                {/* Tarifa por pasajero */}
                <div>
                  <label className="block font-semibold mb-1">Tarifa por pasajero:</label>
                  <input
                    type="number"
                    name="priceTrip"
                    value={tripData.priceTrip}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Ruta opcional */}
                <div>
                  <label className="block font-semibold mb-1">Ruta (opcional):</label>
                  <input
                    type="text"
                    name="route"
                    value={tripData.route}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingrese una descripción de la ruta"
                  />
                </div>

                {/* Botones de acción */}
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="w-full p-2 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700" // Cambiado a azul
                  >
                    Actualizar Viaje
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="w-full p-2 font-semibold text-white bg-gray-600 rounded hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Mostrar formulario de registro si no está en modo edición */}
          {!isEditing && (
            <form onSubmit={handleRegisterTrip} className="space-y-4 mt-6">
              {/* Punto de inicio */}
              <div className="relative" ref={startInputRef}>
                <label className="block font-semibold mb-1">Punto de inicio:</label>
                <input
                  type="text"
                  name="startLocation"
                  value={tripData.startLocation}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ingrese el punto de inicio"
                  required
                  onFocus={() => {
                    if (startSuggestions.length > 0) setShowStartSuggestions(true);
                  }}
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

              {/* Punto de llegada */}
              <div className="relative" ref={endInputRef}>
                <label className="block font-semibold mb-1">Punto de llegada:</label>
                <input
                  type="text"
                  name="endTrip"
                  value={tripData.endTrip}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ingrese el punto de llegada"
                  required
                  onFocus={() => {
                    if (endSuggestions.length > 0) setShowEndSuggestions(true);
                  }}
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

              {/* Hora de salida */}
              <div>
                <label className="block font-semibold mb-1">Hora de salida:</label>
                <input
                  type="time"
                  name="timeTrip"
                  value={tripData.timeTrip}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Cupos */}
              <div>
                <label className="block font-semibold mb-1">Cupos:</label>
                <input
                  type="number"
                  name="availablePlaces"
                  value={tripData.availablePlaces}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="1"
                  max="4"
                />
              </div>

              {/* Tarifa por pasajero */}
              <div>
                <label className="block font-semibold mb-1">Tarifa por pasajero:</label>
                <input
                  type="number"
                  name="priceTrip"
                  value={tripData.priceTrip}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Ruta opcional */}
              <div>
                <label className="block font-semibold mb-1">Ruta (opcional):</label>
                <input
                  type="text"
                  name="route"
                  value={tripData.route}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ingrese una descripción de la ruta"
                />
              </div>

              {/* Botón de registro */}
              <button
                type="submit"
                className={`w-full p-2 font-semibold text-white rounded ${
                  hasActiveTrip ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
                disabled={hasActiveTrip && !isEditing} // Permitir editar incluso si hay un viaje activo
              >
                {hasActiveTrip && !isEditing ? 'Ya tienes un viaje activo' : 'Registrar Viaje'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
