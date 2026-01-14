import React from 'react';
import { Calendar, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge'; 

const HistoryPage: React.FC = () => {
  const trips = [
    { id: 1, date: 'Hoy, 07:30 AM', route: 'Ruta Norte', status: 'completed', price: '$0.35', from: 'Casa', to: 'Facultad' },
    { id: 2, date: 'Ayer, 02:15 PM', route: 'Ruta Norte', status: 'completed', price: '$0.35', from: 'Facultad', to: 'Casa' },
    { id: 3, date: '12 Ene, 08:00 AM', route: 'Ruta Sur', status: 'cancelled', price: '$0.00', from: 'Casa', to: 'Facultad' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Historial de Viajes</h1>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        {trips.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {trips.map((trip) => (
              <div key={trip.id} className="p-5 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                
                <div className="flex gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-2xl text-[#003da5] dark:text-blue-400 h-fit">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{trip.route}</h3>
                    <p className="text-sm text-gray-500">{trip.date}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {trip.from}</span>
                      <span>→</span>
                      <span>{trip.to}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                  {trip.status === 'completed' ? (
                    <Badge className="bg-green-100 text-green-700 border-0 hover:bg-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" /> Completado
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="bg-red-100 text-red-700 border-0 hover:bg-red-200">
                      <XCircle className="w-3 h-3 mr-1" /> Cancelado
                    </Badge>
                  )}
                  <span className="font-bold text-lg">{trip.price}</span>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center text-gray-500">No hay viajes registrados.</div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;