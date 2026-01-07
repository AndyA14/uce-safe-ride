export type Role = 'student' | 'driver' | 'admin';

export interface User {
  id: string;
  email: string;
  role: Role;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  login: (token: string, user: User) => void;
  logout: () => void;
}

