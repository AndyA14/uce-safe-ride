export interface StudentProfile {
  user_id: string;
  full_name: string;
  email: string;
  student_id?: string;
  phone?: string;
}

export interface RecentActivity {
  id: string;
  type: 'trip_completed' | 'bus_notified' | 'route_changed';
  route_name: string;
  message: string;
  timestamp: string;
  time_ago: string;
}
