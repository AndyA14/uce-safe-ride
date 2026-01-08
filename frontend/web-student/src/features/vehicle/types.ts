export interface Vehicle {
    id: string;
    plate: string;
    status: 'ACTIVE' | 'INACTIVE';
    driver_id?: string;
  }