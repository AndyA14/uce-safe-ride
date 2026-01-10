import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

const MapPlaceholder: React.FC = () => {
  return (
    <div className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10">
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--primary) / 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--primary) / 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Decorative roads */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <path
          d="M0,150 Q200,100 400,200 T800,150"
          fill="none"
          stroke="hsl(var(--muted-foreground) / 0.2)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M100,0 Q150,200 100,400"
          fill="none"
          stroke="hsl(var(--muted-foreground) / 0.2)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M300,50 L500,300"
          fill="none"
          stroke="hsl(var(--muted-foreground) / 0.15)"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>

      {/* Bus markers */}
      <div className="absolute top-1/4 left-1/3 animate-pulse">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
            <Navigation className="w-5 h-5 text-white rotate-45" />
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-yellow-500 rounded-full animate-ping" />
        </div>
      </div>

      <div className="absolute top-1/2 right-1/4">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30">
            <Navigation className="w-5 h-5 text-white -rotate-12" />
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-green-500 rounded-full animate-ping" />
        </div>
      </div>

      {/* Stop markers */}
      <div className="absolute bottom-1/3 left-1/4">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-md">
          <MapPin className="w-4 h-4 text-white" />
        </div>
      </div>

      <div className="absolute top-1/3 right-1/3">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-md">
          <MapPin className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* University marker */}
      <div className="absolute bottom-1/4 right-1/4">
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-blue-800 flex items-center justify-center shadow-lg">
            <span className="text-xl font-bold text-white">U</span>
          </div>
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-500 whitespace-nowrap">
            UCE
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur rounded-xl p-3 space-y-2 border border-white/20">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-gray-600">Bus en ruta</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-blue-600" />
          <span className="text-gray-600">Parada</span>
        </div>
      </div>
    </div>
  );
};

export default MapPlaceholder;