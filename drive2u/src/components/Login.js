// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; // Importar useNavigate
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login() {
  const navigate = useNavigate(); // Hook para navegación programática

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        'https://proyecto-final-be-un-bof.vercel.app/login',
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const { token } = response.data;
      localStorage.setItem('token', token);
      toast.success('Inicio de sesión exitoso');
      setTimeout(() => {
        navigate('/dashboard'); // Navega a /dashboard
      }, 1500);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error('Error al iniciar sesión: ' + error.response.data.message);
      } else if (error.message) {
        toast.error('Error al iniciar sesión: ' + error.message);
      } else {
        toast.error('Error al iniciar sesión: Ha ocurrido un error desconocido.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: 'url(https://images2.alphacoders.com/546/thumb-1920-546678.jpg)',
      }}
    >
      <div className="absolute top-4 right-4">
        {/* Puedes agregar aquí un botón para cambiar entre modo oscuro y claro */}
      </div>
      <div className="w-full max-w-md p-8 bg-white bg-opacity-90 rounded-lg shadow-2xl">
        <div className="flex justify-center mb-6">
          {/* Puedes agregar un logo aquí si lo deseas */}
        </div>
        <h2 className="mb-6 text-3xl font-bold text-center text-gray-800">Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-gray-700">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tuemail@ejemplo.com"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700">Contraseña</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
              minLength={8}
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 mb-4 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
          <p className="text-center text-gray-600">
            ¿No tienes una cuenta?{' '}
            <Link to="/register" className="font-semibold text-blue-700 hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Login;
