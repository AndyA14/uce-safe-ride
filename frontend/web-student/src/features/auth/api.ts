import { authHttp } from '@shared/http';

/* =====================
   TYPES
===================== */

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
}

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
