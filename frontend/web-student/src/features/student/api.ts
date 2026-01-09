import { studentHttp } from '@/core/http';
import type { StudentProfile } from './types';

/**
 * Obtiene el perfil del estudiante actual
 * Endpoint: GET /students/me
 */
export const getMyProfile = async (): Promise<StudentProfile> => {
  const res = await studentHttp.get<StudentProfile>('/students/me');
  return res.data;
};
