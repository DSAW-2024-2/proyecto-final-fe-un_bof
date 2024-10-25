import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    surName: '',
    universityID: '',
    email: '',
    phoneNumber: '',
    password: '',
    // Eliminamos 'photo' ya que no estamos manejando archivos
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Construimos el objeto de datos para enviar en JSON
    const data = {
      email: formData.email,
      password: formData.password,
      name: formData.name,
      surName: formData.surName,
      universityID: formData.universityID,
      phoneNumber: formData.phoneNumber,
    };

    try {
      const response = await axios.post(
        'https://proyecto-final-be-un-bof-1.vercel.app/register',
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const { token } = response.data;
      localStorage.setItem('token', token);
      toast.success('Registro exitoso');
      setTimeout(() => {
        window.location.href = '/dashboard';
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-400 via-blue-500 to-purple-600">
      <div className="w-full max-w-xl p-8 bg-white rounded-lg shadow-2xl">
        <div className="flex justify-center mb-6">
          {/* Puedes agregar un logo aquí si lo deseas */}
        </div>
        <h2 className="mb-6 text-3xl font-bold text-center text-gray-800">Crear Cuenta</h2>
        <form onSubmit={handleSubmit}>
          {/* Eliminamos 'encType' ya que no es necesario */}
          <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2">
            <div>
              <label className="block mb-2 font-semibold text-gray-700">Nombre</label>
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
              <label className="block mb-2 font-semibold text-gray-700">Apellido</label>
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
              <label className="block mb-2 font-semibold text-gray-700">ID Universitario</label>
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
              <label className="block mb-2 font-semibold text-gray-700">Número de Teléfono</label>
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
            <label className="block mb-2 font-semibold text-gray-700">Email</label>
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
            <label className="block mb-2 font-semibold text-gray-700">Contraseña</label>
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
          <button
            type="submit"
            className="w-full py-3 mb-4 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Registrarse'}
          </button>
          <p className="text-center text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/" className="font-semibold text-blue-700 hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Register;
