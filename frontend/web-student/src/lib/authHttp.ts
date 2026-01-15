// frontend/web-student/src/lib/authHttp.ts

import axios, { InternalAxiosRequestConfig } from 'axios';

// ================================
// CONFIGURACIÓN BASE DE AXIOS
// ================================
export const authHttp = axios.create({
  baseURL: import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ================================
// INTERCEPTOR DE REQUEST
// ================================
authHttp.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn('⚠️ [authHttp] No se encontró token en localStorage');
    } else {
      // 🔐 Cast seguro para evitar error TS
      if (!config.headers) config.headers = {} as any;
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('✅ [authHttp] Token agregado al request');
    }

    return config;
  },
  (error) => {
    console.error('❌ [authHttp] Error en request:', error);
    return Promise.reject(error);
  }
);

// ================================
// INTERCEPTOR DE RESPONSE
// ================================
authHttp.interceptors.response.use(
  (response) => {
    console.log('✅ [authHttp] Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('❌ [authHttp] Error en response:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });
    return Promise.reject(error);
  }
);
