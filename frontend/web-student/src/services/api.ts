import axios from 'axios';


const api = axios.create({
  // ⚠️ IMPORTANTE: Asegúrate de que este puerto coincida con tu Route Service (8003)
  // O usa una variable de entorno: process.env.REACT_APP_ROUTE_SERVICE_URL
  baseURL: 'http://localhost:8003/api/v1', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token automáticamente (si tu route-service lo requiere)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // O como guardes tu auth
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;