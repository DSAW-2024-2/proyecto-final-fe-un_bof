// src/components/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; // Importar Link y useNavigate
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Register() {
  const navigate = useNavigate(); // Hook para navegación programática

  const [formData, setFormData] = useState({
    userType: '', // 'passenger' o 'driver'
    name: '',
    surName: '',
    universityID: '',
    email: '',
    phoneNumber: '',
    password: '',
    userPhoto: null, // Archivo de foto del usuario
    // Campos adicionales para conductor
    licensePlate: '',
    vehiclePhoto: null, // Archivo de foto del vehículo
    capacity: '',
    soatPhoto: null, // Archivo de foto del SOAT
    brand: '',
    model: '',
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    if (type === 'file') {
      setFormData({
        ...formData,
        [name]: e.target.files[0],
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleUserTypeSelect = (type) => {
    setFormData({
      ...formData,
      userType: type,
    });
  };

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Construimos el objeto FormData para enviar archivos
    const data = new FormData();
    data.append('userType', formData.userType);
    data.append('name', formData.name);
    data.append('surName', formData.surName);
    data.append('universityID', formData.universityID);
    data.append('email', formData.email);
    data.append('phoneNumber', formData.phoneNumber);
    data.append('password', formData.password);
    data.append('userPhoto', formData.userPhoto);

    if (formData.userType === 'driver') {
      data.append('licensePlate', formData.licensePlate);
      data.append('vehiclePhoto', formData.vehiclePhoto);
      data.append('capacity', formData.capacity);
      data.append('soatPhoto', formData.soatPhoto);
      data.append('brand', formData.brand);
      data.append('model', formData.model);
    }

    try {
      const response = await axios.post(
        'https://proyecto-final-be-un-bof.vercel.app/register',
        data
      );
      const { token } = response.data;
      localStorage.setItem('token', token);
      toast.success('Registro exitoso');
      setTimeout(() => {
        navigate('/dashboard'); // Navega a /dashboard
      }, 1500);
    } catch (error) {
      console.error('Error al registrarse:', error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error('Error al registrarse: ' + error.response.data.message);
      } else if (error.message) {
        toast.error('Error al registrarse: ' + error.message);
      } else {
        toast.error('Error al registrarse: Ha ocurrido un error desconocido.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        // Paso 1: Seleccionar tipo de usuario con imágenes
        return (
          <div className="mb-6">
            <h3 className="mb-4 text-xl font-semibold text-gray-800">
              Selecciona tu tipo de usuario
            </h3>
            <div className="flex justify-center space-x-6">
              <div
                onClick={() => handleUserTypeSelect('passenger')}
                className={`cursor-pointer p-4 border-2 rounded-lg ${
                  formData.userType === 'passenger'
                    ? 'border-green-600'
                    : 'border-gray-300'
                }`}
              >
                {/* Usar el enlace directo de pasajero */}
                <img
                  src="https://cdn-icons-png.flaticon.com/512/1042/1042260.png"
                  alt="Pasajero"
                  className="w-24 h-24 mx-auto"
                />
                <p className="mt-2 text-center font-semibold text-gray-700">
                  Pasajero
                </p>
              </div>
              <div
                onClick={() => handleUserTypeSelect('driver')}
                className={`cursor-pointer p-4 border-2 rounded-lg ${
                  formData.userType === 'driver'
                    ? 'border-green-600'
                    : 'border-gray-300'
                }`}
              >
                {/* Usar un enlace directo de conductor */}
                <img
                  src="https://cdn-icons-png.flaticon.com/512/2481/2481723.png" // Enlace de ejemplo, reemplázalo con el correcto si lo tienes
                  alt="Conductor"
                  className="w-24 h-24 mx-auto"
                />
                <p className="mt-2 text-center font-semibold text-gray-700">
                  Conductor
                </p>
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={() => navigate('/login')} // Navegar a /login
                className="px-6 py-2 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700"
                disabled={!formData.userType}
              >
                Siguiente
              </button>
            </div>
          </div>
        );
      case 2:
        // Paso 2: Datos básicos
        return (
          <div>
            <h3 className="mb-4 text-xl font-semibold text-gray-800">
              Información Personal
            </h3>
            <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2">
              <div>
                <label className="block mb-2 font-semibold text-gray-700">
                  Nombre
                </label>
                <input
                  type="text"
                  name="name"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-700">
                  Apellido
                </label>
                <input
                  type="text"
                  name="surName"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.surName}
                  onChange={handleChange}
                  placeholder="Tu apellido"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2">
              <div>
                <label className="block mb-2 font-semibold text-gray-700">
                  ID Universitario
                </label>
                <input
                  type="text"
                  name="universityID"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.universityID}
                  onChange={handleChange}
                  placeholder="12345678"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-700">
                  Número de Teléfono
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+1 234 567 8901"
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-semibold text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                value={formData.email}
                onChange={handleChange}
                placeholder="tuemail@ejemplo.com"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-semibold text-gray-700">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                value={formData.password}
                onChange={handleChange}
                placeholder="********"
                required
                minLength={8}
              />
            </div>
            <div className="mb-6">
              <label className="block mb-2 font-semibold text-gray-700">
                Foto
              </label>
              <input
                type="file"
                name="userPhoto"
                accept="image/*"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-2 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                Siguiente
              </button>
            </div>
          </div>
        );
      case 3:
        // Paso 3: Datos del conductor (si aplica)
        if (formData.userType === 'driver') {
          return (
            <div>
              <h3 className="mb-4 text-xl font-semibold text-gray-800">
                Información del Vehículo
              </h3>
              <div className="mb-4">
                <label className="block mb-2 font-semibold text-gray-700">
                  Placa del Vehículo
                </label>
                <input
                  type="text"
                  name="licensePlate"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.licensePlate}
                  onChange={handleChange}
                  placeholder="ABC123"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-semibold text-gray-700">
                  Foto del Vehículo
                </label>
                <input
                  type="file"
                  name="vehiclePhoto"
                  accept="image/*"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-semibold text-gray-700">
                  Capacidad del Vehículo
                </label>
                <input
                  type="number"
                  name="capacity"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder="4"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-semibold text-gray-700">
                  Foto del SOAT
                </label>
                <input
                  type="file"
                  name="soatPhoto"
                  accept="image/*"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2">
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">
                    Marca
                  </label>
                  <input
                    type="text"
                    name="brand"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="Toyota"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">
                    Modelo
                  </label>
                  <input
                    type="text"
                    name="model"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="Corolla"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  Siguiente
                </button>
              </div>
            </div>
          );
        } else {
          // Si es pasajero, saltamos al paso final
          nextStep();
          return null;
        }
      case 4:
        // Paso 4: Confirmación y envío
        return (
          <div>
            <h3 className="mb-4 text-xl font-semibold text-gray-800">
              Revisa tu información
            </h3>
            {/* Resumen de la información ingresada */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700">Tipo de Usuario:</h4>
              <p className="mb-4 capitalize">{formData.userType}</p>

              <h4 className="font-semibold text-gray-700">Información Personal:</h4>
              <p><strong>Nombre:</strong> {formData.name}</p>
              <p><strong>Apellido:</strong> {formData.surName}</p>
              <p><strong>ID Universitario:</strong> {formData.universityID}</p>
              <p><strong>Teléfono:</strong> {formData.phoneNumber}</p>
              <p><strong>Email:</strong> {formData.email}</p>

              {formData.userType === 'driver' && (
                <>
                  <h4 className="font-semibold text-gray-700 mt-4">Información del Vehículo:</h4>
                  <p><strong>Placa:</strong> {formData.licensePlate}</p>
                  <p><strong>Capacidad:</strong> {formData.capacity}</p>
                  <p><strong>Marca:</strong> {formData.brand}</p>
                  <p><strong>Modelo:</strong> {formData.model}</p>
                </>
              )}
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-2 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Atrás
              </button>
              <button
                type="submit"
                className="px-6 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700"
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Registrarse'}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: 'url(https://images2.alphacoders.com/546/thumb-1920-546678.jpg)',
      }}
    >
      <div className="w-full max-w-xl p-8 bg-white bg-opacity-90 rounded-lg shadow-2xl relative">
        <div className="flex justify-center mb-6">
          {/* Puedes agregar un logo aquí si lo deseas */}
        </div>
        <h2 className="mb-6 text-3xl font-bold text-center text-gray-800">
          Crear Cuenta
        </h2>
        <form onSubmit={handleSubmit}>
          {renderStep()}
        </form>
        {/* Texto para iniciar sesión */}
        <p className="mt-6 text-center text-gray-600">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="text-green-600 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Register;
