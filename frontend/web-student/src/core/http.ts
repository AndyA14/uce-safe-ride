import axios from 'axios';

/* ========= AUTH SERVICE ========= */
export const authHttp = axios.create({
  baseURL: 'http://localhost:8001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ========= STUDENT SERVICE ========= */
export const studentHttp = axios.create({
  baseURL: 'http://localhost:8002/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ========= ROUTE SERVICE ========= */
export const routeHttp = axios.create({
  baseURL: 'http://localhost:8003/api/v1', // <--- ¡Puerto 8003!
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
authHttp.interceptors.request.use(attachToken);
studentHttp.interceptors.request.use(attachToken);
routeHttp.interceptors.request.use(attachToken);
