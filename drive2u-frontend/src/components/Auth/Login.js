// src/components/Auth/Login.js
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await login(credentials.email, credentials.password);
      // Redireccionar según el rol
      navigate('/profile');
    } catch (error) {
      console.error('Error en el inicio de sesión:', error);
      alert('Credenciales inválidas');
    }
  };

  return (
    <div>
      <h2>Inicio de Sesión</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Correo Corporativo" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Contraseña" onChange={handleChange} required />
        <button type="submit">Iniciar Sesión</button>
      </form>
    </div>
  );
};

export default Login;
