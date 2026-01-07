import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerApi } from '../features/auth/api';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      setLoading(true);

      await registerApi({
        email,
        password,
        role: 'STUDENT',
      });

      alert('Registro exitoso. Ahora puedes iniciar sesión.');
      navigate('/login');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', marginTop: 80 }}>
      <h2>Registro de Estudiante</h2>

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

        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>

      <p style={{ marginTop: 16 }}>
        ¿Ya tienes cuenta?{' '}
        <button onClick={() => navigate('/login')}>
          Inicia sesión
        </button>
      </p>
    </div>
  );
}
