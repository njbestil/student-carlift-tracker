import { apiClient } from '../../services/api/apiClient';

export type StudentProfilePayload = {
  studentFullName: string;
  parentFullName: string;
  completeAddress: string;
  emergencyNumber: string;
  profilePhotoUrl?: string;
};

export const studentsApi = {
  updateMe: (payload: StudentProfilePayload, token: string) =>
    apiClient<{ profile: unknown }>('/students/me', {
      method: 'PATCH',
      body: payload,
      token,
    }),
};
