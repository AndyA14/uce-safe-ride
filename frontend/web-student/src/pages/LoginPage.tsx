import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginApi } from '../features/auth/api';
import { useAuth } from '../features/auth/useAuth';
import { AuthLayout } from '../ui/AuthLayout';
import { Input } from '../ui/Input';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await loginApi({ email, password });
      login(response);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Credenciales incorrectas');
    }
  };

  return (
    <AuthLayout 
      title="Bienvenido de nuevo" 
      subtitle="Ingresa a UCE Safe Ride con tu cuenta institucional"
    >
      <form onSubmit={handleSubmit} className="auth-form">
        <Input
          label="Correo Institucional"
          type="email"
          placeholder="ejemplo@uce.edu.ec"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <Input
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p style={{ color: 'red', fontSize: '0.9rem' }}>{error}</p>}

        <button type="submit" className="auth-button">
          Iniciar Sesión
        </button>
      </form>

      <div className="auth-footer">
        ¿No tienes cuenta?{' '}
        <button className="auth-link" onClick={() => navigate('/register')}>
          Regístrate aquí
        </button>
      </div>
    </AuthLayout>
  );
}