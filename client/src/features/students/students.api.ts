import { apiClient } from '../../services/api/apiClient';

export type StudentProfilePayload = {
  studentFullName: string;
  parentFullName: string;
  completeAddress: string;
  emergencyNumber: string;
  profilePhotoUrl?: string;
  latitude?: number;
  longitude?: number;
};

export type StudentProfile = StudentProfilePayload & {
  id: string;
  userId: string;
  profilePhotoUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  serviceStatus: 'ABSENT' | 'WAITING' | 'PICKED_UP' | 'DROPPED_OFF';
  pickedUpAt: string | null;
  droppedOffAt: string | null;
  tripOrigin: 'HOME' | 'SCHOOL';
};

export type AssignedDriver = {
  name: string;
  address: string | null;
  contactNumber: string;
  vehicleType: string | null;
  vehiclePlateNumber: string | null;
};

export const studentsApi = {
  getMe: (token: string) =>
    apiClient<{ profile: StudentProfile | null }>('/students/me', { token }),
  getAssignedDriver: (token: string) =>
    apiClient<{ driver: AssignedDriver }>('/students/me/driver', { token }),
  updateMe: (payload: StudentProfilePayload, token: string) =>
    apiClient<{ profile: StudentProfile }>('/students/me', {
      method: 'PATCH',
      body: payload,
      token,
    }),
};
