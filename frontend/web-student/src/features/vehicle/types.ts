export interface Vehicle {
  id: string;
  plate: string;
  status: 'ACTIVE' | 'INACTIVE';
  driver_id?: string;
  capacity?: number;
  current_occupancy?: number;
  route_id?: string;
  route_name?: string;
  driver_name?: string;
}
