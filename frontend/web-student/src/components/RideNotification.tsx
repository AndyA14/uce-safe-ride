import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertTriangle, Info, Zap } from 'lucide-react';

interface RideNotificationProps {
  id: number;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  duration?: number;
  onClose: () => void;
}

const RideNotification: React.FC<RideNotificationProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Animación de entrada
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    // Auto-cierre después de la duración
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-green-500 to-green-600',
          icon: <CheckCircle size={24} />,
          borderColor: 'border-green-400'
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-amber-500 to-amber-600',
          icon: <AlertTriangle size={24} />,
          borderColor: 'border-amber-400'
        };
      case 'info':
        return {
          bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
          icon: <Info size={24} />,
          borderColor: 'border-blue-400'
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-500 to-red-600',
          icon: <AlertTriangle size={24} />,
          borderColor: 'border-red-400'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-slate-500 to-slate-600',
          icon: <Info size={24} />,
          borderColor: 'border-slate-400'
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl shadow-2xl border-2 ${styles.borderColor}
        transform transition-all duration-300 ease-out
        min-w-[320px] max-w-[400px]
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      {/* Fondo degradado */}
      <div className={`${styles.bg} text-white p-4`}>
        <div className="flex items-start gap-3">
          {/* Icono */}
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              {styles.icon}
            </div>
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <h4 className="font-black text-sm mb-1 drop-shadow-lg">
              {title}
            </h4>
            <p className="text-xs text-white/90 leading-relaxed">
              {message}
            </p>
          </div>

          {/* Botón de cierre */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all"
          >
            <X size={14} />
          </button>
        </div>

        {/* Barra de progreso */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div 
            className="h-full bg-white/50 transition-all ease-linear"
            style={{
              width: isExiting ? '0%' : '100%',
              transitionDuration: `${duration}ms`
            }}
          />
        </div>
      </div>

      {/* Efecto de brillo */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer pointer-events-none" />
    </div>
  );
};

export default RideNotification;

// Agregar estos estilos al CSS global o Tailwind config:
/*
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 3s infinite;
}
*/