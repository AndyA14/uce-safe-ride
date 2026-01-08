import { authHttp } from '@/core/http';
import type { LoginRequest, RegisterRequest, AuthResponse } from './types';

/* =====================
   API CALLS
===================== */

export async function loginApi(
  data: LoginRequest
): Promise<AuthResponse> {
  const res = await authHttp.post('/auth/login', data);
  return res.data;
}

export async function registerApi(
  data: RegisterRequest
): Promise<AuthResponse> {
  const res = await authHttp.post('/auth/register', data);
  return res.data;
}
