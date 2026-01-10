export type UserRole = 'student' | 'driver';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface StudentProfile {
  full_name: string;
  email: string;
  phone: string;
}

export interface BusStop {
  id: string;
  name: string;
  studentsWaiting: number;
  estimatedArrival: string;
}

export interface Bus {
  id: string;
  name: string;
  driver: string;
  status: 'active' | 'inactive' | 'maintenance';
  currentRoute: string;
  passengers: number;
  capacity: number;
}

export interface Trip {
  id: string;
  date: string;
  route: string;
  pickup: string;
  dropoff: string;
  duration: string;
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'danger';
  message: string;
  time: string;
}
