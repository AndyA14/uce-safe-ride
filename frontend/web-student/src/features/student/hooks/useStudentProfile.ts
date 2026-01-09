import { useEffect, useState } from 'react';
import { getMyProfile } from '../api';
import type { StudentProfile } from '../types';

export function useStudentProfile() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMyProfile();
        setProfile(data);
      } catch (err) {
        setError('No se pudo cargar el perfil');
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return { profile, loading, error };
}
