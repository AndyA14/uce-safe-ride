export type UserRole = 'STUDENT' | 'DRIVER' | 'ADMIN'
export type DriverStatus = 'AVAILABLE' | 'ON_ROUTE' | 'OFFLINE'

/* =========================
   USUARIO BASE (PLANO)
========================= */

export interface User {
  id: string

  // Algunos backends devuelven ambos, soportamos los dos
  user_id?: string

  name: string
  email: string
  role: UserRole

  // -------- STUDENT --------
  student_id?: string
  career?: string
  semester?: number

  // -------- DRIVER --------
  ci?: string
  license_number?: string
  phone?: string
  status?: DriverStatus

  // UI
  avatar?: string
}

/* =========================
   AUTH
========================= */

export interface LoginResponse {
  user: User
  access_token: string
}

export interface LoginCredentials {
  email: string
  password: string
  role: UserRole
}

/* =========================
   PERFILES (DOMINIO)
========================= */

// Perfil estudiante (si luego lo separas del User)
export interface StudentProfile {
  full_name: string
  email: string
  phone?: string
}

// Perfil conductor (opcional, útil para /drivers/me)
export interface DriverProfile {
  id: string
  user_id: string
  name: string
  license_number: string
  phone?: string
  status: DriverStatus
}

/* =========================
   TRANSPORTE / MAPA
========================= */

export interface BusStop {
  id: string
  name: string
  studentsWaiting: number
  estimatedArrival: string
}

export type BusStatus = 'active' | 'inactive' | 'maintenance'

export interface Bus {
  id: string
  name: string
  driver: string
  status: BusStatus
  currentRoute: string
  passengers: number
  capacity: number
}

export interface Trip {
  id: string
  date: string
  route: string
  pickup: string
  dropoff: string
  duration: string
}

/* =========================
   ALERTAS / UI
========================= */

export type AlertType = 'info' | 'warning' | 'danger'

export interface Alert {
  id: string
  type: AlertType
  message: string
  time: string
}
