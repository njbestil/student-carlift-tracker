import { apiClient } from '../../services/api/apiClient';

export type DriverProfilePayload = {
  fullName: string;
  profilePhotoUrl?: string;
};

export const driversApi = {
  updateMe: (payload: DriverProfilePayload, token: string) =>
    apiClient<{ profile: unknown }>('/drivers/me', {
      method: 'PATCH',
      body: payload,
      token,
    }),
};
