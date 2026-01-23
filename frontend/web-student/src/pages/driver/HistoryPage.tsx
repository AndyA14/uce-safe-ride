import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Truck, Calendar, Users, ChevronRight, Loader2, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { transportService } from '@/services/tripService';

const HistoryPage: React.FC = () => {
  const { user } = useAuth(); //
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      if (!user?.id) return;
      const data = await transportService.getDriverHistory(user.id);
      setHistory(data);
      setLoading(false);
    };
    loadHistory();
  }, [user?.id]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-200 dark:bg-slate-950"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-200 dark:bg-slate-950 p-6 md:p-10 transition-colors animate-fade-in">
      <div className="max-w-5xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Bitácora de Viajes</h1>
          <p className="text-slate-500">Historial completo de tus servicios realizados.</p>
        </header>

        {history.length === 0 ? (
          <Card className="p-20 text-center bg-white dark:bg-slate-900 border-dashed border-2">
            <Truck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400">No tienes viajes finalizados en este periodo.</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {history.map((trip) => (
              <Card key={trip.id} className="bg-white dark:bg-slate-900 border-none shadow-md hover:shadow-xl transition-all group overflow-hidden rounded-3xl">
                <CardContent className="p-0 flex flex-col md:flex-row items-stretch">
                  <div className="bg-slate-50 dark:bg-slate-800 p-6 flex flex-col justify-center items-center border-r border-slate-100 dark:border-slate-800">
                    <Calendar className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-sm font-bold">{new Date(trip.end_time).toLocaleDateString()}</span>
                  </div>
                  <div className="p-6 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-[#FFC107]" />
                      <h3 className="font-bold text-slate-800 dark:text-white">Ruta: {trip.route_id}</h3>
                    </div>
                    <div className="flex gap-6 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Users size={14}/> {trip.passenger_count || 0} Estudiantes</span>
                      <span className="flex items-center gap-1"><Clock size={14}/> {trip.duration || '25 min'}</span>
                    </div>
                  </div>
                  <div className="p-6 flex items-center justify-end bg-slate-50/50 dark:bg-slate-800/30">
                    <button className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700">
                      Detalles <ChevronRight size={16} />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;