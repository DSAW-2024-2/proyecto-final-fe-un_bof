// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Verificar si el usuario está autenticado al cargar la app
  useEffect(() => {
    axios.get('http://localhost:5000/api/users/profile', { withCredentials: true })
      .then(response => {
        setUser(response.data);
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  const login = async (email, password) => {
    try {
      await axios.post('http://localhost:5000/api/auth/login', { email, password }, { withCredentials: true });
      const res = await axios.get('http://localhost:5000/api/users/profile', { withCredentials: true });
      setUser(res.data);
    } catch (error) {
      console.error('Error en el inicio de sesión:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      await axios.post('http://localhost:5000/api/auth/register', userData, { withCredentials: true });
      const res = await axios.get('http://localhost:5000/api/users/profile', { withCredentials: true });
      setUser(res.data);
    } catch (error) {
      console.error('Error en el registro:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout', {}, { withCredentials: true });
      setUser(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
