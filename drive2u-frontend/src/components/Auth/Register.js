// src/components/Auth/Register.js
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [role, setRole] = useState('passenger');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    lastName: '',
    id: '',
    contactNumber: '',
    // Campos adicionales para conductores
    plate: '',
    capacity: '',
    brand: '',
    model: '',
    // Manejo de imágenes
    vehiclePhoto: null,
    soatPhoto: null,
    userPhoto: null,
  });

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

    // Crear FormData para manejar archivos
    const data = new FormData();
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('role', role);
    data.append('name', formData.name);
    data.append('lastName', formData.lastName);
    data.append('id', formData.id);
    data.append('contactNumber', formData.contactNumber);

    if (role === 'driver') {
      data.append('plate', formData.plate);
      data.append('capacity', formData.capacity);
      data.append('brand', formData.brand);
      data.append('model', formData.model);
      if (formData.vehiclePhoto) data.append('vehiclePhoto', formData.vehiclePhoto);
      if (formData.soatPhoto) data.append('soatPhoto', formData.soatPhoto);
      if (formData.userPhoto) data.append('userPhoto', formData.userPhoto);
    }

    try {
      await register(data);
      navigate(role === 'driver' ? '/driver/dashboard' : '/passenger/dashboard');
    } catch (error) {
      console.error('Error en el registro:', error);
      alert('Error en el registro');
    }
  };

  return (
    <div>
      <h2>Registro</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="passenger">Pasajero</option>
          <option value="driver">Conductor</option>
        </select>
        <input type="email" name="email" placeholder="Correo Corporativo" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Contraseña" onChange={handleChange} required />
        <input type="text" name="name" placeholder="Nombre" onChange={handleChange} required />
        <input type="text" name="lastName" placeholder="Apellido" onChange={handleChange} required />
        <input type="text" name="id" placeholder="ID Universidad" onChange={handleChange} required />
        <input type="text" name="contactNumber" placeholder="Número de Contacto" onChange={handleChange} required />

        {role === 'driver' && (
          <>
            <input type="text" name="plate" placeholder="Placa del Vehículo" onChange={handleChange} required />
            <input type="number" name="capacity" placeholder="Capacidad del Vehículo" onChange={handleChange} required />
            <input type="text" name="brand" placeholder="Marca del Vehículo" onChange={handleChange} required />
            <input type="text" name="model" placeholder="Modelo del Vehículo" onChange={handleChange} required />
            <input type="file" name="vehiclePhoto" accept="image/*" onChange={handleChange} required />
            <input type="file" name="soatPhoto" accept="image/*" onChange={handleChange} required />
            <input type="file" name="userPhoto" accept="image/*" onChange={handleChange} required />
          </>
        )}

        <button type="submit">Registrarse</button>
      </form>
    </div>
  );
};

export default Register;
