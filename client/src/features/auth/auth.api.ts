import { apiClient } from '../../services/api/apiClient';
import type { AuthResponse } from '../../services/api/apiTypes';

export type RegisterPayload = {
  mobileNumber: string;
  password: string;
  confirmPassword: string;
};

export type LoginPayload = {
  mobileNumber: string;
  password: string;
};

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiClient<AuthResponse>('/auth/register', {
      method: 'POST',
      body: payload,
    }),

  login: (payload: LoginPayload) =>
    apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: payload,
    }),

  forgotPassword: (mobileNumber: string) =>
    apiClient<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: { mobileNumber },
    }),
};
