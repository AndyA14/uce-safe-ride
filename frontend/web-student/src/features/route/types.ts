export interface Route {
  id: string;
  name: string;
  direction: 'OUTBOUND' | 'INBOUND';
  active: boolean;
  created_at?: string;
}

export interface RouteWithStats extends Route {
  active_buses?: number;
}
