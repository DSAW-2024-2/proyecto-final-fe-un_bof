import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Iconos personalizados para marcadores
const greenIcon = new L.Icon({
  iconUrl: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
  iconSize: [32, 32],
});

const redIcon = new L.Icon({
  iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
  iconSize: [32, 32],
});

const DriverDashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [tripData, setTripData] = useState({
    startLocation: '',
    endTrip: '',
    timeTrip: '',
    availablePlaces: '',
    priceTrip: '',
    route: '',
  });
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);
  const [startLocationCoords, setStartLocationCoords] = useState(null);
  const [endTripCoords, setEndTripCoords] = useState(null);

  const startLocationRef = useRef();
  const endTripRef = useRef();

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Token no encontrado. Por favor, inicia sesión nuevamente.');
          navigate('/login');
          return;
        }

        const response = await axios.get('https://proyecto-final-be-un-bof.vercel.app/users', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response && response.data) {
          const { name, surName } = response.data;
          setUserName(`${name} ${surName}`);
        } else {
          throw new Error('La respuesta de la API no contiene datos válidos.');
        }
      } catch (error) {
        toast.error('Error al obtener tu información.');
        console.error(error.message);
      }
    };

    fetchUserName();
  }, [navigate]);

  const fetchSuggestions = async (query, setSuggestions, setCoords) => {
    if (!query) return setSuggestions([]);

    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: query,
          format: 'json',
          addressdetails: 1,
          limit: 5,
        },
      });

      setSuggestions(response.data);

      if (response.data.length > 0) {
        const { lat, lon } = response.data[0];
        setCoords([parseFloat(lat), parseFloat(lon)]);
      }
    } catch (error) {
      console.error('Error al obtener sugerencias:', error.message);
      setSuggestions([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTripData({ ...tripData, [name]: value });

    if (name === 'startLocation') {
      fetchSuggestions(value, setStartSuggestions, setStartLocationCoords);
    } else if (name === 'endTrip') {
      fetchSuggestions(value, setEndSuggestions, setEndTripCoords);
    }
  };

  const handleSelectSuggestion = (suggestion, field) => {
    const { display_name, lat, lon } = suggestion;

    if (field === 'startLocation') {
      setTripData({ ...tripData, startLocation: display_name });
      setStartLocationCoords([parseFloat(lat), parseFloat(lon)]);
      setStartSuggestions([]);
    } else if (field === 'endTrip') {
      setTripData({ ...tripData, endTrip: display_name });
      setEndTripCoords([parseFloat(lat), parseFloat(lon)]);
      setEndSuggestions([]);
    }
  };

  const handleRegisterTrip = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Token no encontrado. Por favor, inicia sesión nuevamente.');
        navigate('/login');
        return;
      }

      await axios.post(
        'https://proyecto-final-be-un-bof.vercel.app/trip/create',
        tripData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      toast.success('¡Viaje registrado con éxito!');
      setTripData({
        startLocation: '',
        endTrip: '',
        timeTrip: '',
        availablePlaces: '',
        priceTrip: '',
        route: '',
      });
      setStartLocationCoords(null);
      setEndTripCoords(null);
    } catch (error) {
      toast.error('Error al registrar el viaje.');
      console.error(error.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <ToastContainer />
      <div className="flex flex-col md:flex-row flex-1">
        <div className="w-full md:w-3/5 h-1/2 md:h-full">
          <MapContainer center={[4.80923, -74.05701]} zoom={13} className="w-full h-full">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {startLocationCoords && (
              <Marker position={startLocationCoords} icon={greenIcon}>
                <Popup>{tripData.startLocation}</Popup>
              </Marker>
            )}
            {endTripCoords && (
              <Marker position={endTripCoords} icon={redIcon}>
                <Popup>{tripData.endTrip}</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        <div className="w-full md:w-2/5 h-1/2 md:h-full p-6 bg-white border-t md:border-l border-gray-300 overflow-auto">
          <h2 className="text-2xl font-bold mb-4">Registrar un viaje:</h2>
          <div className="mb-6 text-lg font-medium">Bienvenido, {userName}</div>
          <form onSubmit={handleRegisterTrip} className="space-y-4">
            <div>
              <label className="block font-semibold mb-1">Punto de inicio:</label>
              <input
                type="text"
                name="startLocation"
                value={tripData.startLocation}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Ingrese el punto de inicio"
                ref={startLocationRef}
              />
              {startSuggestions.length > 0 && (
                <ul className="bg-white border border-gray-300 rounded mt-1">
                  {startSuggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="p-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => handleSelectSuggestion(suggestion, 'startLocation')}
                    >
                      {suggestion.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label className="block font-semibold mb-1">Punto de llegada:</label>
              <input
                type="text"
                name="endTrip"
                value={tripData.endTrip}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Ingrese el punto de llegada"
                ref={endTripRef}
              />
              {endSuggestions.length > 0 && (
                <ul className="bg-white border border-gray-300 rounded mt-1">
                  {endSuggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="p-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => handleSelectSuggestion(suggestion, 'endTrip')}
                    >
                      {suggestion.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label className="block font-semibold mb-1">Hora de salida:</label>
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
              <input
                type="number"
                name="availablePlaces"
                value={tripData.availablePlaces}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
                min="1"
                max="4"
              />
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
              <label className="block font-semibold mb-1">Ruta (opcional):</label>
              <input
                type="text"
                name="route"
                value={tripData.route}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Ingrese una descripción de la ruta"
              />
            </div>

            <button type="submit" className="w-full p-2 font-semibold text-white bg-blue-600 rounded">
              Registrar Viaje
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
