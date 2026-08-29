import { apiClient } from '../../services/api/apiClient';

export type DriverProfilePayload = {
  fullName: string;
  address: string;
  vehicleType: string;
  vehiclePlateNumber: string;
  profilePhotoUrl?: string;
  latitude?: number;
  longitude?: number;
};

export type DriverProfile = DriverProfilePayload & {
  id: string;
  userId: string;
  profilePhotoUrl: string | null;
  address: string | null;
  vehicleType: string | null;
  vehiclePlateNumber: string | null;
  latitude: number | null;
  longitude: number | null;
  isOnService: boolean;
};

export type StudentServiceStatus = 'ABSENT' | 'WAITING' | 'PICKED_UP' | 'DROPPED_OFF';

export type AssignedStudent = {
  userId: string;
  studentFullName: string;
  parentFullName: string;
  contactNumber: string;
  emergencyNumber: string;
  completeAddress: string;
  profilePhotoUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  serviceStatus: StudentServiceStatus;
};

export type DriverTrip = {
  id: string;
  tripOrigin: 'HOME' | 'SCHOOL';
  status: 'IN_PROGRESS' | 'COMPLETED';
  startedAt: string;
  completedAt: string | null;
};

export type DriverDashboard = {
  profile: DriverProfile | null;
  activeTrip: DriverTrip | null;
  students: AssignedStudent[];
};

export const driversApi = {
  getMe: (token: string) => apiClient<{ profile: DriverProfile | null }>('/drivers/me', { token }),
  getDashboard: (token: string) => apiClient<DriverDashboard>('/drivers/me/dashboard', { token }),
  updateMe: (payload: DriverProfilePayload, token: string) =>
    apiClient<{ profile: DriverProfile }>('/drivers/me', {
      method: 'PATCH',
      body: payload,
      token,
    }),
  updateServiceStatus: (isOnService: boolean, token: string) =>
    apiClient<{ profile: DriverProfile }>('/drivers/me/service-status', {
      method: 'PATCH',
      body: { isOnService },
      token,
    }),
  startTrip: (tripOrigin: DriverTrip['tripOrigin'], token: string) =>
    apiClient<{ trip: DriverTrip }>('/drivers/me/trips', {
      method: 'POST',
      body: { tripOrigin },
      token,
    }),
  updateStudentServiceStatus: (userId: string, serviceStatus: StudentServiceStatus, token: string) =>
    apiClient<{ kind: 'updated'; student: AssignedStudent; trip: DriverTrip }>(`/drivers/me/trips/students/${userId}/status`, {
      method: 'PATCH',
      body: { serviceStatus },
      token,
    }),
};
