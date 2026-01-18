import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HistoryPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-200 dark:bg-slate-950 text-slate-900 dark:text-slate-200 p-8 md:p-12 animate-fade-in transition-colors duration-300">
      
      {/* Contenedor centrado */}
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-6 items-end">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Historial de Viajes</h1>
          <Button variant="outline" className="text-slate-900 dark:text-white border-slate-300 dark:border-slate-800">
            Ver más
          </Button>
        </div>

        {/* Tarjetas de historial */}
        <Card className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 shadow-md">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 pb-4">
            <CardTitle className="text-lg text-slate-800 dark:text-white">
              <Truck className="w-5 h-5 text-[#FFC107]" /> Viaje #1
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-slate-600 dark:text-slate-300">Detalles del viaje...</div>
            {/* Agregar más detalles del viaje aquí */}
          </CardContent>
        </Card>

        {/* Más tarjetas de historial... */}
      </div>
    </div>
  );
};

export default HistoryPage;
