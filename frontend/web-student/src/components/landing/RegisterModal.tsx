import React, { useState } from 'react';
import { X, Eye, EyeOff, User, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { registerUser } from '@/services/authService'; 
import { useNavigate } from 'react-router-dom';
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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  // Validaciones
  const passwordsMatch = password === confirmPassword;
  const passwordTouched = confirmPassword.length > 0;
  const isFormValid = fullName.trim() !== '' && 
                      email.trim() !== '' && 
                      password.length >= 6 && 
                      passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!isFormValid) return;
    
    setIsSubmitting(true);

    try {
      console.log('Registrando usuario...');
      
      // 1. Registrar en Auth Service
      await registerUser(fullName, email, password, 'STUDENT');
      console.log('Usuario registrado exitosamente');
      
      setSuccess(true);
      
      // 2. Hacer login automático
      try {
        console.log('Iniciando sesión automática...');
        const user = await login(email, password, 'STUDENT');
        
        console.log('Login exitoso:', user);
        onClose();
        
        // 3. El backend auto-crea el perfil, así que siempre redirigimos a completar perfil
        // (El perfil tendrá full_name="Estudiante nuevo")
        navigate('/student/complete-profile', {
          state: { 
            message: '¡Registro exitoso! Completa tu perfil para comenzar.' 
          }
        });
        
      } catch (loginErr: any) {
        console.error('Error en login automático:', loginErr);
        // Si falla el login automático, mostrar pantalla de login
        setSuccess(false);
        onSwitchToLogin();
      }

    } catch (err: any) {
      console.error('Error en registro:', err);
      
      const errorDetail = err.response?.data?.detail;
      
      // Mensajes de error personalizados
      if (errorDetail === 'User already exists') {
        setError('Este correo ya está registrado. Por favor inicia sesión.');
      } else if (errorDetail === 'Invalid UCE email') {
        setError('Debes usar un correo institucional @uce.edu.ec');
      } else {
        setError(errorDetail || 'Error al registrarse. Verifica tus datos.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border animate-scale-in overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="gradient-primary p-6 text-center relative">
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
          
          {/* Error Alert */}
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>¡Registro exitoso! Iniciando sesión...</span>
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
                disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Debe ser un correo @uce.edu.ec
            </p>
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
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                disabled={isSubmitting}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
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

          <Button 
            type="submit" 
            className="w-full font-semibold" 
            size="lg"
            disabled={!isFormValid || isSubmitting || success}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Registrando...
              </>
            ) : success ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                ¡Registrado!
              </>
            ) : (
              'Crear Cuenta'
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{' '}
            <button 
              type="button"
              onClick={onSwitchToLogin}
              className="text-primary hover:underline font-medium"
              disabled={isSubmitting}
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