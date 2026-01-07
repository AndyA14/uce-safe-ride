import { http } from './http';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from '../data-models/auth.interface';

export const login = async (
  data: LoginRequest
): Promise<AuthResponse> => {
  const response = await http.post<AuthResponse>(
    '/api/v1/auth/login',
    data
  );
  return response.data;
};

export const register = async (
  data: RegisterRequest
): Promise<void> => {
  await http.post('/api/v1/auth/register', data);
};


