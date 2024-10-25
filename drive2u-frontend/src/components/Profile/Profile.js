// src/components/Profile/Profile.js
import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(user);
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    contactNumber: '',
    // Otros campos según el rol
  });

  // URL base del backend desplegado en Vercel
  const API_BASE_URL = 'https://drive2u-backend.vercel.app/api';

  useEffect(() => {
    setProfileData(user);
  }, [user]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    for (const key in formData) {
      if (formData[key]) data.append(key, formData[key]);
    }

    try {
      await axios.put(`${API_BASE_URL}/users/profile`, data, { withCredentials: true });
      alert('Perfil actualizado exitosamente');
      // Refrescar los datos del usuario
      window.location.reload();
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      alert('Error al actualizar el perfil');
    }
  };

  return (
    <div>
      <h2>Perfil</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input type="text" name="name" placeholder="Nombre" onChange={handleChange} defaultValue={profileData?.name} />
        <input type="text" name="lastName" placeholder="Apellido" onChange={handleChange} defaultValue={profileData?.lastName} />
        <input type="text" name="contactNumber" placeholder="Número de Contacto" onChange={handleChange} defaultValue={profileData?.contactNumber} />
        {/* Campos adicionales para conductores */}
        {profileData?.role === 'driver' && (
          <>
            <input type="text" name="plate" placeholder="Placa del Vehículo" onChange={handleChange} defaultValue={profileData?.plate} />
            <input type="number" name="capacity" placeholder="Capacidad del Vehículo" onChange={handleChange} defaultValue={profileData?.capacity} />
            <input type="text" name="brand" placeholder="Marca del Vehículo" onChange={handleChange} defaultValue={profileData?.brand} />
            <input type="text" name="model" placeholder="Modelo del Vehículo" onChange={handleChange} defaultValue={profileData?.model} />
            <input type="file" name="vehiclePhoto" accept="image/*" onChange={handleChange} />
            <input type="file" name="soatPhoto" accept="image/*" onChange={handleChange} />
            <input type="file" name="userPhoto" accept="image/*" onChange={handleChange} />
          </>
        )}
        <button type="submit">Actualizar Perfil</button>
      </form>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  );
};

export default Profile;
