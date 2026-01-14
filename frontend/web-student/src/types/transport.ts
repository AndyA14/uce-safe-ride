export interface StudentProfile {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  phone?: string;
}

export interface DriverProfile {
  id: string;
  auth_user_id?: string;
  name: string;
  phone?: string;
  license_number?: string;
  status?: string;
  ci?: string;
}

// Interfaz del Vehículo (Actualizada a la nueva arquitectura)
export interface Vehicle {
  id: string;
  plate: string;
  model?: string; 
  vehicle_type: string;
  capacity: number;
  status: 'AVAILABLE' | 'IN_ROUTE' | 'FULL' | 'MAINTENANCE' | 'ACTIVE' | 'INACTIVE'; 
  is_active: boolean;
  driver_name?: string; 
  driver_id?: string;
  student_user_id?: string; 
}