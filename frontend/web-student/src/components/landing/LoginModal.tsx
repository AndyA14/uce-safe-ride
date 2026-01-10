import React, { useState } from 'react';
import { X, Eye, EyeOff, User, Truck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/user';
import uceLogo from '@/assets/uce-logo.png';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister?: () => void;
}

const roles: { id: UserRole; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'student', label: 'Estudiante', icon: User, description: 'Accede a rutas y horarios' },
  { id: 'driver', label: 'Conductor', icon: Truck, description: 'Gestiona tu recorrido' },
];

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSwitchToRegister }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null); // Estado para errores
  const [isLoading, setIsLoading] = useState(false); // Estado de carga
  
  const { login } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Conexión real al endpoint /api/v1/auth/login
      await login(email, password, selectedRole);
      onClose(); // Solo cerramos si el login fue exitoso
    } catch (err) {
      console.error("Login fallido", err);
      setError("Credenciales incorrectas o error de conexión.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal: Cambiado max-w-md a max-w-sm para ser más pequeño */}
      <div className="relative w-full max-w-sm bg-card rounded-2xl shadow-2xl border border-border animate-scale-in overflow-hidden">
        
        {/* Header Compacto */}
        <div className="gradient-primary p-5 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          
          <img 
            src={uceLogo} 
            alt="UCE Logo" 
            className="w-16 h-16 mx-auto mb-2 bg-white rounded-full p-1"
          />
          <h2 className="text-xl font-bold text-white">UCE Safe Ride</h2>
          <p className="text-white/80 text-xs mt-1">Sistema de Transporte Universitario</p>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Mensaje de Error Visual */}
          {error && (
            <div className="p-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded flex items-center gap-2">
              <AlertCircle className="w-3 h-3" />
              {error}
            </div>
          )}

          {/* Role Selection Compacto */}
          <div>
            <Label className="text-xs font-medium mb-2 block">Selecciona tu rol</Label>
            <div className="grid grid-cols-2 gap-2">
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    selectedRole === role.id
                      ? 'border-accent bg-accent/10 shadow-sm'
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                >
                  <role.icon className={`w-6 h-6 mx-auto mb-1 ${
                    selectedRole === role.id ? 'text-primary' : 'text-muted-foreground'
                  }`} strokeWidth={1.5} />
                  <p className={`text-xs font-medium ${
                    selectedRole === role.id ? 'text-primary' : 'text-muted-foreground'
                  }`}>{role.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-xs font-medium">Correo Institucional</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email" // Fix Chrome warning
              placeholder="usuario@uce.edu.ec"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 h-9 text-sm"
              required
            />
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password" className="text-xs font-medium">Contraseña</Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password" // Fix Chrome warning
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-8 h-9 text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <Button 
            type="submit" 
            className="w-full font-semibold h-10 text-sm" 
            disabled={isLoading}
          >
            {isLoading ? "Entrando..." : "Iniciar Sesión"}
          </Button>

          {/* Footer */}
          <div className="text-center space-y-1.5 pt-1">
            {selectedRole === 'student' && onSwitchToRegister && (
              <p className="text-xs text-muted-foreground">
                ¿No tienes cuenta?{' '}
                <button 
                  type="button"
                  onClick={onSwitchToRegister}
                  className="text-primary hover:underline font-medium"
                >
                  Regístrate aquí
                </button>
              </p>
            )}
            <p className="text-[10px] text-muted-foreground">
              ¿Problemas para acceder?{' '}
              <a href="#" className="text-primary hover:underline font-medium">
                Contacta a soporte
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;