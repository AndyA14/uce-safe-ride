import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginApi, registerApi } from '@features/auth/api';
import { useAuth } from '@features/auth/hooks/useAuth';
import '@/styles/components/landing/LoginModal.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
}

export default function LoginModal({ isOpen, onClose, initialTab = 'login' }: LoginModalProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  
  // Register state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerLoading, setRegisterLoading] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    try {
      setLoginLoading(true);
      const response = await loginApi({ email: loginEmail, password: loginPassword });
      login(response.access_token);
      onClose();
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Credenciales incorrectas');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);

    if (registerPassword !== registerConfirmPassword) {
      setRegisterError('Las contraseñas no coinciden');
      return;
    }

    try {
      setRegisterLoading(true);
      await registerApi({ email: registerEmail, password: registerPassword });
      alert('Registro exitoso. Inicia sesión.');
      setActiveTab('login');
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterConfirmPassword('');
    } catch {
      setRegisterError('Error al registrar usuario');
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2>Bienvenido</h2>
          <p>Inicia sesión en UCE Safe Ride</p>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Iniciar Sesión
          </button>
          <button
            className={`tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            Registrarse
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              <input
                type="email"
                placeholder="Correo institucional"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
              {loginError && <p className="error">{loginError}</p>}
              <button type="submit" disabled={loginLoading}>
                {loginLoading ? 'Ingresando...' : 'Iniciar sesión'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit}>
              <input
                type="email"
                placeholder="Correo institucional"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Confirmar contraseña"
                value={registerConfirmPassword}
                onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                required
              />
              {registerError && <p className="error">{registerError}</p>}
              <button type="submit" disabled={registerLoading}>
                {registerLoading ? 'Registrando...' : 'Registrarse'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
