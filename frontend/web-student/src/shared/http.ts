import axios from 'axios';

/* ========= AUTH SERVICE ========= */
export const authHttp = axios.create({
  baseURL: 'http://localhost:8001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ========= VEHICLE SERVICE ========= */
export const vehicleHttp = axios.create({
  baseURL: 'http://localhost:8004/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ========= TOKEN INTERCEPTOR ========= */
const attachToken = (config: any) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

vehicleHttp.interceptors.request.use(attachToken);
