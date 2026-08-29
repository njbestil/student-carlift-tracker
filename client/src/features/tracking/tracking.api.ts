import { apiClient } from '../../services/api/apiClient';

export type VehicleLocation = {
  id: string;
  driverId: string;
  latitude: string;
  longitude: string;
  accuracy: string | null;
  heading: string | null;
  speed: string | null;
  recordedAt: string;
  createdAt: string;
};

export type CreateVehicleLocationInput = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  recordedAt?: string;
};

type VehicleLocationResponse = {
  location: VehicleLocation | null;
};

export const trackingApi = {
  createVehicleLocation(token: string, input: CreateVehicleLocationInput) {
    return apiClient<VehicleLocationResponse>('/vehicle-locations', {
      method: 'POST',
      token,
      body: input,
    });
  },

  getMyDriverLatestLocation(token: string) {
    return apiClient<VehicleLocationResponse>('/vehicle-locations/my-driver/latest', { token });
  },
};
