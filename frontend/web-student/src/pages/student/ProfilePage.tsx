import { useStudentProfile } from '@/features/student/hooks/useStudentProfile';
import '@/styles/pages/ProfilePage.css';

export default function ProfilePage() {
  const { profile, loading, error } = useStudentProfile();

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-state">Cargando perfil...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="profile-page">
        <div className="error-state">{error || 'No se pudo cargar el perfil'}</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Mi Perfil</h1>
        <p>Información académica y personal</p>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              {profile.full_name?.charAt(0).toUpperCase() || 'E'}
            </div>
            <h2>{profile.full_name || 'Estudiante'}</h2>
            <p className="profile-email">{profile.email}</p>
          </div>

          <div className="profile-form">
            <div className="form-group">
              <label>Nombre Completo</label>
              <input 
                type="text" 
                value={profile.full_name || ''} 
                disabled 
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Correo Institucional</label>
              <input 
                type="email" 
                value={profile.email || ''} 
                disabled 
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>ID de Estudiante</label>
              <input 
                type="text" 
                value={profile.student_id || 'No disponible'} 
                disabled 
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Teléfono</label>
              <input 
                type="tel" 
                value={profile.phone || 'No disponible'} 
                disabled 
                className="form-input"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
