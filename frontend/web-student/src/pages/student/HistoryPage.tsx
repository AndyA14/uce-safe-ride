import React from 'react';
import { History, Bus, Calendar, User, CheckCircle, Clock, XCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface TripRecord {
  id: string;
  date: string;
  time: string;
  route: string;
  driver: string;
  status: 'completed' | 'cancelled' | 'in_progress';
  duration: string;
}

const mockTrips: TripRecord[] = [
  { id: '1', date: '2024-01-15', time: '07:30', route: 'Ruta Norte - Campus', driver: 'Carlos Mendoza', status: 'completed', duration: '25 min' },
  { id: '2', date: '2024-01-14', time: '18:00', route: 'Campus - Ruta Sur', driver: 'María López', status: 'completed', duration: '30 min' },
  { id: '3', date: '2024-01-14', time: '07:45', route: 'Ruta Norte - Campus', driver: 'Carlos Mendoza', status: 'completed', duration: '22 min' },
  { id: '4', date: '2024-01-13', time: '17:30', route: 'Campus - Ruta Centro', driver: 'José García', status: 'cancelled', duration: '-' },
  { id: '5', date: '2024-01-13', time: '08:00', route: 'Ruta Sur - Campus', driver: 'María López', status: 'completed', duration: '28 min' },
  { id: '6', date: '2024-01-12', time: '07:30', route: 'Ruta Norte - Campus', driver: 'Carlos Mendoza', status: 'completed', duration: '24 min' },
  { id: '7', date: '2024-01-11', time: '18:15', route: 'Campus - Ruta Norte', driver: 'Carlos Mendoza', status: 'completed', duration: '26 min' },
  { id: '8', date: '2024-01-11', time: '07:45', route: 'Ruta Centro - Campus', driver: 'José García', status: 'completed', duration: '20 min' },
];

const statusConfig = {
  completed: { label: 'Completado', icon: CheckCircle, className: 'bg-success/10 text-success border-success/20' },
  cancelled: { label: 'Cancelado', icon: XCircle, className: 'bg-destructive/10 text-destructive border-destructive/20' },
  in_progress: { label: 'En curso', icon: Clock, className: 'bg-accent/10 text-accent-foreground border-accent/20' },
};

const HistoryPage: React.FC = () => {
  const completedTrips = mockTrips.filter(t => t.status === 'completed').length;
  const totalTrips = mockTrips.length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="uce-card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <History className="w-6 h-6 text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalTrips}</p>
              <p className="text-sm text-muted-foreground">Total de viajes</p>
            </div>
          </div>
        </div>
        <div className="uce-card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completedTrips}</p>
              <p className="text-sm text-muted-foreground">Viajes completados</p>
            </div>
          </div>
        </div>
        <div className="uce-card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Bus className="w-6 h-6 text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">3</p>
              <p className="text-sm text-muted-foreground">Rutas utilizadas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trips Table */}
      <div className="uce-card overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <History className="w-5 h-5 text-primary" strokeWidth={1.5} />
            Historial de Viajes
          </h2>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> Fecha
                  </div>
                </TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Ruta</TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" /> Conductor
                  </div>
                </TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTrips.map((trip) => {
                const status = statusConfig[trip.status];
                const StatusIcon = status.icon;
                return (
                  <TableRow key={trip.id}>
                    <TableCell className="font-medium">{trip.date}</TableCell>
                    <TableCell>{trip.time}</TableCell>
                    <TableCell>{trip.route}</TableCell>
                    <TableCell>{trip.driver}</TableCell>
                    <TableCell>{trip.duration}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={status.className}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
