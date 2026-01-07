import type { RegisterRequest, LoginRequest, AuthResponse } from '../types/auth.types';

const API_URL = 'http://localhost:8001/api/v1/auth';

export const authService = {
  async register(data: RegisterRequest): Promise<void> {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Error al registrar usuario');
    }
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Credenciales inválidas');
    }

    return res.json();
  },
};
