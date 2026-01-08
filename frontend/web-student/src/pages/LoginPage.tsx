import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginApi } from '@features/auth/api';
import { useAuth } from '@features/auth/useAuth';


export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      const response = await loginApi({ email, password });
      login(response.access_token);
      navigate('/');
    } catch {
      setError('Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>UCE Safe Ride</h1>
        <p>Inicia sesión para continuar</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Correo institucional"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="auth-footer">
          ¿No tienes cuenta?{' '}
          <button
            type="button"
            className="link"
            onClick={() => navigate('/register')}
          >
            Regístrate aquí
          </button>
        </p>
      </div>
    </div>
  );
}
