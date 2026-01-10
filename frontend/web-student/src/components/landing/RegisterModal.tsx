import React, { useState } from 'react';
import { X, Eye, EyeOff, User, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { registerUser } from '@/services/authService'; // <--- IMPORTANTE: Importamos el servicio real
import uceLogo from '@/assets/uce-logo.png';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null); // <--- Estado para errores del backend

  const { login } = useAuth(); // Usaremos esto para auto-loguear al usuario tras registrarse

  if (!isOpen) return null;

  // Validation
  const passwordsMatch = password === confirmPassword;
  const passwordTouched = confirmPassword.length > 0;
  const isFormValid = fullName.trim() !== '' && 
                      email.trim() !== '' && 
                      password.length >= 6 && 
                      passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Limpiar errores previos
    
    if (!isFormValid) return;
    
    setIsSubmitting(true);
    
    try {
      // 1. LLAMADA REAL AL BACKEND (FastAPI)
      // Enviamos 'student' hardcodeado porque este modal es solo para estudiantes
      await registerUser(fullName, email, password, 'student');
      
      // 2. Si llegamos aquí, el registro fue exitoso.
      // Intentamos auto-iniciar sesión para mejorar la UX
      try {
        await login(email, password, 'student');
        onClose(); // Cerramos el modal
      } catch (loginErr) {
        // Si falla el auto-login, al menos cerramos y mandamos al login
        onSwitchToLogin();
      }

    } catch (err: any) {
      console.error("Error en registro:", err);
      // Intentamos mostrar el mensaje que viene del backend (ej: "Email already registered")
      const backendMessage = err.response?.data?.detail || "Error al registrarse. Verifica tus datos.";
      setError(backendMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border animate-scale-in overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Header with UCE branding */}
        <div className="gradient-primary p-6 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          <img 
            src={uceLogo} 
            alt="UCE Logo" 
            className="w-16 h-16 mx-auto mb-2 bg-white rounded-full p-1"
          />
          <h2 className="text-xl font-bold text-white">Registro de Estudiante</h2>
          <p className="text-white/80 text-sm mt-1">UCE Safe Ride</p>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Mensaje de Error del Backend */}
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Full Name */}
          <div>
            <Label htmlFor="fullName" className="text-sm font-medium">
              Nombre Completo <span className="text-destructive">*</span>
            </Label>
            <div className="relative mt-1.5">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="fullName"
                type="text"
                placeholder="Juan Pérez García"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="registerEmail" className="text-sm font-medium">
              Correo Institucional <span className="text-destructive">*</span>
            </Label>
            <Input
              id="registerEmail"
              type="email"
              placeholder="usuario@uce.edu.ec"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5"
              required
            />
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="registerPassword" className="text-sm font-medium">
              Contraseña <span className="text-destructive">*</span>
            </Label>
            <div className="relative mt-1.5">
              <Input
                id="registerPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirmar Contraseña <span className="text-destructive">*</span>
            </Label>
            <div className="relative mt-1.5">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`pr-10 ${
                  passwordTouched 
                    ? passwordsMatch 
                      ? 'border-green-500 focus-visible:ring-green-500' 
                      : 'border-destructive focus-visible:ring-destructive'
                    : ''
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            {/* Password Validation Message */}
            {passwordTouched && (
              <div className={`flex items-center gap-1.5 mt-2 text-sm ${
                passwordsMatch ? 'text-green-600' : 'text-destructive'
              }`}>
                {passwordsMatch ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Las contraseñas coinciden</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    <span>Las contraseñas no coinciden</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Submit */}
          <Button 
            type="submit" 
            className="w-full font-semibold" 
            size="lg"
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? 'Registrando...' : 'Crear Cuenta'}
          </Button>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{' '}
            <button 
              type="button"
              onClick={onSwitchToLogin}
              className="text-primary hover:underline font-medium"
            >
              Iniciar Sesión
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterModal;