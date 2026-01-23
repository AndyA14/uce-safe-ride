export type TripStatus = 'CREATED' | 'ACTIVE' | 'FINISHED';

export interface Trip {
  id: number;
  route_id: string;
  vehicle_id: string;
  driver_id: string;
  status: TripStatus;
  start_time?: string;
  end_time?: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  driver_id: string;
}