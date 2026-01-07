export interface RegisterRequest {
    email: string;
    password: string;
    role: 'STUDENT';
  }
  
  export interface LoginRequest {
    email: string;
    password: string;
  }
  
  export interface AuthResponse {
    access_token: string;
    token_type: string;
  }

