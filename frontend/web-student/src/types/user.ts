// src/types/user.ts

export type UserRole = 'STUDENT' | 'DRIVER' | 'ADMIN';
export type DriverStatus = 'AVAILABLE' | 'ON_ROUTE' | 'OFFLINE';

/* =========================
   USUARIO BASE (PLANO)
========================= */

export interface User {
  id: string;                    // Auth ID
  driver_id?: string | null;      // ID operativo (opcional, puede ser null o no asignado)
  
  // Info básica
  email: string;
  name: string;
  role: UserRole;

  // -------- STUDENT --------
  student_id?: string;
  career?: string;
  semester?: number;

  // -------- DRIVER --------
  ci?: string;
  license_number?: string;
  phone?: string;
  status?: DriverStatus;

  // UI
  avatar?: string;
}

/* =========================
   AUTH
========================= */

export interface LoginResponse {
  user: User;
  access_token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: UserRole;
}

/* =========================
   PERFILES (DOMINIO)
========================= */

export interface StudentProfile {
  full_name: string;
  email: string;
  phone?: string;
  student_id?: string;
  career?: string;
  semester?: number;
}

export interface DriverProfile {
  id: string;              // Driver ID interno (para servicios)
  user_id: string;         // Auth User ID (del token)
  name: string;
  email: string;
  license_number?: string;
  phone?: string;
  status?: DriverStatus;
  created_at?: Date;       // Fecha de creación (ahora es de tipo Date)
}

/* =========================
   TRANSPORTE / MAPA
========================= */

export interface BusStop {
  id: string;
  name: string;
  studentsWaiting: number;
  estimatedArrival: string;
}

export type BusStatus = 'active' | 'inactive' | 'maintenance';

export interface Bus {
  id: string;
  name: string;
  driver: string;
  status: BusStatus;
  currentRoute: string;
  passengers: number;
  capacity: number;
}

export interface Trip {
  id: string;
  date: Date;              // Fecha (ahora es de tipo Date)
  route: string;
  pickup: string;
  dropoff: string;
  duration: string;
}

/* =========================
   ALERTAS / UI
========================= */

export type AlertType = 'info' | 'warning' | 'danger' | 'custom';  // Se añadió 'custom' para mayor flexibilidad

export interface Alert {
  id: string;
  type: AlertType;
  message: string;
  time: string;
}
