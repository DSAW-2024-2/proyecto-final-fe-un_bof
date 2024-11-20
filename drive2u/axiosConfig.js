// axiosConfig.js
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://proyecto-final-be-un-bof.vercel.app', // Cambia esto a la URL de tu backend
    withCredentials: true // Activa las credenciales en todas las solicitudes
});

export default axiosInstance;
