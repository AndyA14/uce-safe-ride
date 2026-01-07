import type { LoginRequest, RegisterRequest, AuthResponse } from './types';

const API_URL = 'http://localhost:8001/api/v1/auth'; 

export async function loginApi(data: LoginRequest): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Login failed');
  }

  return res.json();
}

export async function registerApi(data: RegisterRequest): Promise<void> {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Register failed');
  }
}