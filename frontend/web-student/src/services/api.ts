import axios from 'axios';

const api = axios.create({
  // ✅ Trip Service vive en el puerto 8010
  // ✅ Ruta base confirmada por Swagger: /api/v1
  baseURL: 'http://localhost:8010/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔐 Interceptor para agregar el token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
