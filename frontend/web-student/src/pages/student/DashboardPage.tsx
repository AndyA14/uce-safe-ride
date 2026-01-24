import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Clock, Bus, Navigation, Bell, User, Star, 
  Zap, ShieldCheck, AlertTriangle, ArrowRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { routeService } from '@/services/routeService';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeRoutesCount, setActiveRoutesCount] = useState(0);

  // Efecto visual para obtener datos simples
  useEffect(() => {
    const loadData = async () => {
      try {
        const routes = await routeService.getAllRoutes();
        setActiveRoutesCount(routes.length || 3);
      } catch (e) {
        setActiveRoutesCount(3); // Fallback visual
      }
    };
    loadData();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[calc(100vh-6rem)] animate-fade-in pb-4">

      {/* =======================================================
          COLUMNA IZQUIERDA: HERO SECTION (REEMPLAZO DEL MAPA)
      ======================================================= */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* 1. TARJETA PRINCIPAL (HERO) - "Llamativo" */}
        <div className="relative flex-1 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden border border-blue-500/30 flex flex-col justify-between group min-h-[400px]">
          
          {/* Fondo Decorativo Animado */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-white/10 transition-all duration-1000" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />
          
          {/* Patrón de puntos sutil */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

          {/* Contenido Superior */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs font-bold mb-4 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              SISTEMA OPERATIVO
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-2 tracking-tight">
              Hola, {user?.name?.split(' ')[0] || 'Viajero'} <span className="inline-block animate-wave">👋</span>
            </h1>
            <p className="text-blue-100 text-lg font-medium max-w-md">
              La flota de la Universidad Central está activa. ¿Hacia dónde nos dirigimos hoy?
            </p>
          </div>

          {/* Ilustración Central (Abstracta con Iconos) */}
          <div className="absolute top-1/2 right-8 -translate-y-1/2 hidden md:block">
             <div className="relative w-64 h-64">
                {/* Círculos concéntricos */}
                <div className="absolute inset-0 border-[3px] border-white/10 rounded-full animate-[spin_10s_linear_infinite]" />
                <div className="absolute inset-4 border border-white/5 rounded-full" />
                
                {/* Icono Central Flotante */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 bg-white rounded-3xl shadow-blue-900/50 shadow-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500">
                        <Bus className="w-12 h-12 text-blue-600" />
                    </div>
                </div>

                {/* Elementos orbitando */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 p-2 rounded-xl shadow-lg animate-bounce">
                    <Clock className="w-5 h-5 text-yellow-900" />
                </div>
                <div className="absolute bottom-10 right-0 bg-green-500 p-2 rounded-full shadow-lg">
                    <MapPin className="w-4 h-4 text-white" />
                </div>
             </div>
          </div>

          {/* Botones de Acción (Parte Inferior) */}
          <div className="relative z-10 mt-auto flex flex-col sm:flex-row gap-4">
            <Button 
              className="h-16 px-8 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-black text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex-1 sm:flex-none w-full sm:w-auto min-w-[200px]"
              onClick={() => navigate('/student/transport')}
            >
              <Navigation className="mr-2 w-6 h-6" />
              VER MAPA EN VIVO
            </Button>

            <div className="flex gap-4 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                <div className="flex-1 min-w-[140px] h-16 bg-blue-800/40 backdrop-blur-sm border border-blue-400/30 rounded-2xl flex items-center justify-center flex-col px-4 hover:bg-blue-800/60 transition-colors cursor-default">
                    <span className="text-2xl font-bold text-white">{activeRoutesCount}</span>
                    <span className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">Rutas Activas</span>
                </div>
                <div className="flex-1 min-w-[140px] h-16 bg-blue-800/40 backdrop-blur-sm border border-blue-400/30 rounded-2xl flex items-center justify-center flex-col px-4 hover:bg-blue-800/60 transition-colors cursor-default">
                    <span className="text-xl font-bold text-white flex items-center gap-1">
                        4.8 <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </span>
                    <span className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">Calidad Servicio</span>
                </div>
            </div>
          </div>
        </div>

        {/* 2. BARRA DE AVISOS RÁPIDOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Aviso Importante */}
             <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 p-5 rounded-3xl flex items-start gap-4">
                <div className="bg-amber-100 dark:bg-amber-800 p-3 rounded-xl shrink-0">
                    <AlertTriangle className="text-amber-600 dark:text-amber-400 w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-bold text-amber-800 dark:text-amber-200 text-sm">Desvío por obras</h3>
                    <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-1 leading-relaxed">
                        La entrada principal está cerrada. Los buses están ingresando por la Facultad de Deportes.
                    </p>
                </div>
             </div>

             {/* Tip de Seguridad */}
             <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 p-5 rounded-3xl flex items-start gap-4 cursor-pointer hover:bg-emerald-100/50 transition-colors" onClick={() => navigate('/student/profile')}>
                <div className="bg-emerald-100 dark:bg-emerald-800 p-3 rounded-xl shrink-0">
                    <ShieldCheck className="text-emerald-600 dark:text-emerald-400 w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-bold text-emerald-800 dark:text-emerald-200 text-sm">Viaja Seguro</h3>
                    <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-1 leading-relaxed">
                        Recuerda mostrar tu carnet digital al abordar. Toca aquí para ver tu perfil.
                    </p>
                </div>
             </div>
        </div>

      </div>

      {/* =======================================================
          COLUMNA DERECHA: INFO PERSONAL (IGUAL QUE ANTES)
      ======================================================= */}
      <div className="w-full lg:w-[380px] flex flex-col gap-6">

        {/* 📊 Perfil Rápido */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm border border-gray-100 dark:border-slate-800 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-2xl font-black border-2 border-white dark:border-slate-700 shadow-sm shrink-0">
                {user?.name ? user.name.charAt(0) : <User />}
            </div>
            <div className="flex-1 min-w-0">
                <h2 className="font-bold text-lg text-slate-800 dark:text-white truncate">{user?.name || 'Estudiante'}</h2>
                <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase">
                        {user?.role === 'STUDENT' ? 'Estudiante' : user?.role}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" title="Online"></span>
                </div>
            </div>
            <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => navigate('/student/notifications')}>
                <Bell className="w-5 h-5 text-slate-400" />
            </Button>
        </div>

        {/* 🚀 Accesos Directos */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm border border-gray-100 dark:border-slate-800 flex-1">
          <h3 className="font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
            <Zap className="text-yellow-500 fill-yellow-500" size={18}/>
            Accesos Rápidos
          </h3>
          
          <div className="space-y-3">
             <button 
                onClick={() => navigate('/student/history')}
                className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
             >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm text-slate-600 dark:text-slate-300">
                        <Clock size={18} />
                    </div>
                    <div className="text-left">
                        <p className="font-bold text-sm text-slate-700 dark:text-white">Mis Viajes</p>
                        <p className="text-[10px] text-slate-400">Ver historial completo</p>
                    </div>
                </div>
                <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
             </button>

             <button 
                onClick={() => navigate('/student/profile')}
                className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
             >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm text-slate-600 dark:text-slate-300">
                        <User size={18} />
                    </div>
                    <div className="text-left">
                        <p className="font-bold text-sm text-slate-700 dark:text-white">Mi Perfil</p>
                        <p className="text-[10px] text-slate-400">Editar datos</p>
                    </div>
                </div>
                <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
             </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
             <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 text-center">
                <p className="text-xs font-bold text-blue-800 dark:text-blue-300 mb-1">¿Necesitas ayuda?</p>
                <p className="text-[10px] text-blue-600/70 dark:text-blue-400/70 mb-3">Contacta a soporte técnico</p>
                <Button variant="outline" size="sm" className="w-full rounded-xl border-blue-200 text-blue-700 hover:bg-blue-100 h-8 text-xs font-bold">
                    Soporte UCE
                </Button>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;