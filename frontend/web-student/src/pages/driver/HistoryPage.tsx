
import React, { useState } from 'react';
import { History, MapPin, Users, Clock, Calendar, CheckCircle, Filter, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Trip {
  id: string;
  date: string;
  route: string;
  startTime: string;
  endTime: string;
  passengers: number;
  distance: string;
  status: 'completed' | 'cancelled';
}

const HistoryPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'week' | 'month'>('all');

  // Mock data - TODO: Replace with API call
  const trips: Trip[] = [
    {
      id: '1',
      date: '2024-01-15',
      route: 'Ruta Norte',
      startTime: '07:30',
      endTime: '08:45',
      passengers: 35,
      distance: '25 km',
      status: 'completed',
    },
    {
      id: '2',
      date: '2024-01-15',
      route: 'Ruta Norte',
      startTime: '14:00',
      endTime: '15:15',
      passengers: 28,
      distance: '25 km',
      status: 'completed',
    },
    {
      id: '3',
      date: '2024-01-14',
      route: 'Ruta Norte',
      startTime: '07:30',
      endTime: '08:45',
      passengers: 40,
      distance: '25 km',
      status: 'completed',
    },
    {
      id: '4',
      date: '2024-01-14',
      route: 'Ruta Norte',
      startTime: '14:00',
      endTime: '15:15',
      passengers: 32,
      distance: '25 km',
      status: 'completed',
    },
    {
      id: '5',
      date: '2024-01-13',
      route: 'Ruta Norte',
      startTime: '07:30',
      endTime: '08:45',
      passengers: 38,
      distance: '25 km',
      status: 'completed',
    },
  ];

  const stats = {
    totalTrips: trips.length,
    totalPassengers: trips.reduce((sum, trip) => sum + trip.passengers, 0),
    totalDistance: '375 km',
    averagePassengers: Math.round(trips.reduce((sum, trip) => sum + trip.passengers, 0) / trips.length),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <History className="w-6 h-6 text-primary" />
            Historial de Viajes
          </h1>
          <p className="text-muted-foreground">Revisa tu actividad y estadísticas</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('week')}
          >
            <Filter className="w-4 h-4 mr-2" />
            Esta semana
          </Button>
          <Button
            variant={filter === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('month')}
          >
            Este mes
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <MapPin className="w-6 h-6 mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.totalTrips}</p>
            <p className="text-sm text-muted-foreground">Viajes realizados</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <Users className="w-6 h-6 mb-2 text-accent" />
            <p className="text-2xl font-bold">{stats.totalPassengers}</p>
            <p className="text-sm text-muted-foreground">Pasajeros totales</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <Clock className="w-6 h-6 mb-2 text-success" />
            <p className="text-2xl font-bold">{stats.averagePassengers}</p>
            <p className="text-sm text-muted-foreground">Promedio por viaje</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <MapPin className="w-6 h-6 mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold">{stats.totalDistance}</p>
            <p className="text-sm text-muted-foreground">Distancia total</p>
          </CardContent>
        </Card>
      </div>

      {/* Trips List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Viajes Recientes
            </CardTitle>
            <Button variant="ghost" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    trip.status === 'completed' ? 'bg-success/10' : 'bg-destructive/10'
                  }`}>
                    {trip.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <Clock className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{trip.route}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(trip.date).toLocaleDateString('es-EC', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {trip.startTime} - {trip.endTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {trip.distance}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{trip.passengers}</p>
                    <p className="text-xs text-muted-foreground">pasajeros</p>
                  </div>
                  <Badge variant={trip.status === 'completed' ? 'default' : 'destructive'}>
                    {trip.status === 'completed' ? 'Completado' : 'Cancelado'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-6">
            <Button variant="outline">Ver más viajes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoryPage;