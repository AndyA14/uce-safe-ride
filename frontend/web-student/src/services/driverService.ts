import axios from 'axios';

// ✅ INTERFAZ CORRECTA: Aseguramos que tenga 'name'
export interface DriverProfile {
  id: string;
  user_id: string;
  name: string; // <-- Esta es la propiedad que te faltaba
  email: string;
  license_number?: string;
  phone?: string;
  ci?: string;
  status?: string;
}

// Ajusta el puerto (Driver Service suele ser 8005)
const API_URL = 'http://localhost:8005/api/v1/drivers';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor para Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getDriverProfile = async (): Promise<DriverProfile> => {
  const response = await api.get<DriverProfile>('/me');
  return response.data;
};